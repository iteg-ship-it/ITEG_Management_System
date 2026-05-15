﻿import { useState, useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  MdCloudUpload, MdCheckCircle, MdExpandMore, MdExpandLess,
  MdBook, MdTopic, MdSubject, MdDelete, MdSave, MdEdit, MdVisibility,
  MdAssignment, MdAdd,
} from "react-icons/md";
import { toast } from "react-toastify";
import {
  useCreateSyllabusVersionMutation,
  useUploadCombinedSyllabusMutation,
  useGetSyllabusVersionsBySubLevelQuery,
  useGetSyllabusVersionWithHierarchyQuery,
  useDeleteSyllabusVersionMutation,
  useApproveSyllabusVersionMutation,
  useActivateSyllabusVersionMutation,
  useGetAllSessionsQuery,
  useGetTasksBySyllabusVersionQuery,
  useBulkUploadTasksMutation,
  useGetSubjectsByVersionQuery,
  useGetTopicsBySubjectQuery,
  useGetSubTopicsByTopicQuery,
  useCreateTaskManualMutation,
  useAddSubjectToVersionMutation,
} from "../../../../redux/api/authApi";
import TaskManagementModal from "./TaskManagementModal";
import SmartSyllabusUpdate from "./SmartSyllabusUpdate";

/* ─── helpers ─────────────────────────────────────────── */
const normalize = (v) => (v === undefined || v === null ? "" : String(v).trim());

/* Download combined syllabus+task template */
const downloadSyllabusTemplate = () => {
  const data = [
    ["Subject", "Topic", "SubTopic", "Task", "Time Days", "Measurable Points"],
    ["JavaScript", "Basics", "Variables", "Q1 - Explain var/let/const", "2", "Student should explain difference between var, let and const"],
    ["JavaScript", "Basics", "Variables", "Q2 - Implement examples", "3", "Student should write 5 examples using each"],
    ["JavaScript", "Basics", "Operators", "Q1 - Operator quiz", "1", "Student should solve 10 operator problems"],
    ["JavaScript", "Functions", "", "Q1 - Write 3 functions", "2", "Student should write declaration, expression and arrow function"],
    ["JavaScript", "DOM", "", "", "", ""],
    ["React", "Hooks", "useState", "Q1 - Build counter", "5", "Student should build a counter app using useState"],
    ["React", "Hooks", "useEffect", "Q1 - Fetch API", "7", "Student should fetch data from an API using useEffect"],
    ["React", "Components", "", "", "", ""],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws, "Syllabus+Tasks");

  const instructions = [
    ["INSTRUCTIONS"],
    [""],
    ["COLUMNS:"],
    ["Subject         → Subject name (e.g. JavaScript, React)"],
    ["Topic           → Topic name (e.g. Basics, Functions)"],
    ["SubTopic        → SubTopic name — leave empty if topic has no subtopic"],
    ["Task            → Task title (e.g. Q1 - Explain...) — leave empty for syllabus-only rows"],
    ["Time Days       → Expected days to complete the task (number)"],
    ["Measurable Points → What the student should be able to do"],
    [""],
    ["RULES:"],
    ["1. Subject + Topic are REQUIRED in every row"],
    ["2. SubTopic is optional — leave empty if topic has no subtopic"],
    ["3. Task is optional — leave empty for syllabus-only rows (no task)"],
    ["4. Multiple tasks for same topic/subtopic = multiple rows with same Subject/Topic/SubTopic"],
    ["5. One upload creates both Syllabus structure AND Tasks together"],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(instructions);
  ws2["!cols"] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

  XLSX.writeFile(wb, "syllabus_tasks_template.xlsx");
};

const parseExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(ws, { defval: "" }));
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

const buildHierarchy = (rows) => {
  const subjectMap = new Map();
  rows.forEach((row) => {
    const subject      = normalize(row["Subject"]    || row["subject"] || row["SUBJECT"]);
    const topic        = normalize(row["Topic"]      || row["Topic Name"] || row["topic"] || row["TOPIC"]);
    const subTopicName = normalize(row["SubTopic"]   || row["Sub Topic"]  || row["subtopic"] || row["sub_topic"] || row["SUBTOPIC"]);
    const taskTitle    = normalize(row["Task"]       || row["Task Title"] || row["taskTitle"] || row["Tasks"] || row["TASK"] || "");
    const timeDays     = row["Time Days"] || row["timeDays"] || row["Time"] || row["TIME DAYS"] || null;
    const measurablePoints = normalize(row["Measurable Points"] || row["Measurable Point"] || row["measurablePoints"] || row["MEASURABLE POINTS"] || "");
    if (!subject || !topic) return;
    if (!subjectMap.has(subject)) subjectMap.set(subject, new Map());
    const topicMap = subjectMap.get(subject);
    if (!topicMap.has(topic)) topicMap.set(topic, []);
    const stList = topicMap.get(topic);
    // Store subtopic with optional task info
    if (subTopicName) {
      const existing = stList.find(st => (typeof st === "object" ? st.name : st) === subTopicName && !taskTitle);
      if (!existing || taskTitle) {
        stList.push(taskTitle ? { name: subTopicName, taskTitle, timeDays, measurablePoints } : { name: subTopicName });
      }
    } else if (taskTitle) {
      // Topic-level task (no subtopic)
      stList.push({ name: "__topic_task__", taskTitle, timeDays, measurablePoints, isTopicTask: true });
    }
  });
  return Array.from(subjectMap.entries()).map(([subjectName, topicMap]) => ({
    subject: subjectName,
    topics: Array.from(topicMap.entries()).map(([topicName, stList]) => ({
      topic: topicName,
      subTopics: stList.filter(st => !st.isTopicTask),
      topicTasks: stList.filter(st => st.isTopicTask),
    })),
  }));
};

// Build flat task rows from hierarchy for combined upload
const buildTaskRows = (hierarchy) => {
  const rows = [];
  hierarchy.forEach(({ subject, topics }) => {
    topics.forEach(({ topic, subTopics, topicTasks }) => {
      // Topic-level tasks
      (topicTasks || []).forEach(t => {
        rows.push({ subject, topic, subTopic: "", taskTitle: t.taskTitle, timeDays: t.timeDays, measurablePoints: t.measurablePoints });
      });
      // SubTopic rows (with or without tasks)
      (subTopics || []).forEach(st => {
        rows.push({
          subject, topic,
          subTopic: st.name,
          taskTitle: st.taskTitle || "",
          timeDays: st.timeDays || null,
          measurablePoints: st.measurablePoints || ""
        });
      });
      // If no subtopics and no topic tasks, still register the topic
      if (!topicTasks?.length && !subTopics?.length) {
        rows.push({ subject, topic, subTopic: "", taskTitle: "", timeDays: null, measurablePoints: "" });
      }
    });
  });
  return rows;
};

/* ─── Status badge ─────────────────────────────────────── */
const STATUS_STYLE = {
  draft:    "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  active:   "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};
const StatusBadge = ({ status }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[status] || "bg-gray-100 text-gray-500"}`}>
    {status?.toUpperCase()}
  </span>
);

/* ─── Accordion (drawer preview) ───────────────────────── */
const SubjectAccordion = ({ item, index }) => {
  const [open, setOpen] = useState(index === 0);
  const [openTopics, setOpenTopics] = useState({});
  const toggleTopic = (t) => setOpenTopics((p) => ({ ...p, [t]: !p[t] }));

  const taskCount = item.topics.reduce(
    (acc, t) => acc + t.subTopics.filter((st) => typeof st === "object" && st.taskTitle).length,
    0
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((p) => !p)} className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 hover:bg-orange-100 transition">
        <div className="flex items-center gap-2">
          <MdBook size={18} className="text-orange-500 flex-shrink-0" />
          <span className="font-semibold text-sm text-gray-800">{item.subject}</span>
          <span className="text-xs text-gray-400 ml-1">({item.topics.length} topics)</span>
          {taskCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              {taskCount} tasks
            </span>
          )}
        </div>
        {open ? <MdExpandLess size={18} className="text-gray-400" /> : <MdExpandMore size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="divide-y divide-gray-100">
          {item.topics.map((t) => (
            <div key={t.topic}>
              <button onClick={() => toggleTopic(t.topic)} className="w-full flex items-center justify-between px-6 py-2.5 bg-white hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <MdTopic size={15} className="text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t.topic}</span>
                  {t.subTopics.length > 0 && <span className="text-xs text-gray-400">({t.subTopics.length} subtopics)</span>}
                </div>
                {t.subTopics.length > 0 && (openTopics[t.topic] ? <MdExpandLess size={15} className="text-gray-300" /> : <MdExpandMore size={15} className="text-gray-300" />)}
              </button>
              {openTopics[t.topic] && t.subTopics.length > 0 && (
                <div className="bg-gray-50 px-10 py-2 space-y-1">
                  {t.subTopics.map((st, i) => {
                    const stName = typeof st === "object" ? st.name : st;
                    const hasTask = typeof st === "object" && st.taskTitle;
                    return (
                      <div key={`${stName}-${i}`} className="py-0.5">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MdSubject size={13} className="text-gray-400 flex-shrink-0" />
                          <span>{stName}</span>
                          {hasTask && (
                            <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-medium">
                              <MdAssignment size={11} />{st.taskTitle}
                            </span>
                          )}
                        </div>
                        {hasTask && (
                          <div className="ml-5 mt-0.5 flex gap-2 flex-wrap">
                            {st.timeDays && <span className="text-xs text-gray-400">⏱ {st.timeDays} days</span>}
                            {st.measurablePoints && <span className="text-xs text-gray-400 italic">📋 {st.measurablePoints}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MANUAL SYLLABUS FORM (single subject → topics → subtopics)
══════════════════════════════════════════════════════════ */
export const ManualSyllabusForm = forwardRef(({ level, subLevel, onSaved }, ref) => {
  const subLevelId = subLevel?._id;
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [subject,           setSubject]           = useState("");
  const [topics,            setTopics]            = useState([{ name: "", subTopics: [""] }]);
  const [saving,            setSaving]            = useState(false);

  const [createSyllabusVersion] = useCreateSyllabusVersionMutation();
  const { data: sessionsData }  = useGetAllSessionsQuery();
  const sessions = sessionsData?.data || [];

  const ic = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white";
  const lc = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

  const reset = () => {
    setSubject(""); setSelectedSessionId("");
    setTopics([{ name: "", subTopics: [""] }]);
  };

  const addTopic        = () => setTopics((p) => [...p, { name: "", subTopics: [""] }]);
  const removeTopic     = (ti) => setTopics((p) => p.filter((_, i) => i !== ti));
  const updateTopicName = (ti, val) => setTopics((p) => p.map((t, i) => i === ti ? { ...t, name: val } : t));
  const addSubTopic     = (ti) => setTopics((p) => p.map((t, i) => i === ti ? { ...t, subTopics: [...t.subTopics, ""] } : t));
  const removeSubTopic  = (ti, si) => setTopics((p) => p.map((t, i) => i === ti ? { ...t, subTopics: t.subTopics.filter((_, j) => j !== si) } : t));
  const updateSubTopic  = (ti, si, val) => setTopics((p) => p.map((t, i) => i === ti ? { ...t, subTopics: t.subTopics.map((s, j) => j === si ? val : s) } : t));

  const buildSubjectPayload = () => ({
    name: subject.trim(),
    topics: topics.filter((t) => t.name.trim()).map((t, ti) => ({
      name: t.name.trim(),
      order: ti + 1,
      subTopics: t.subTopics.filter((s) => s.trim()).map((s, si) => ({ name: s.trim(), order: si + 1 })),
    })),
  });

  const handleSave = async () => {
    if (!subject.trim())     { toast.error("Subject name required"); return; }
    const validTopics = topics.filter((t) => t.name.trim());
    if (!validTopics.length) { toast.error("At least one topic required"); return; }
    if (!selectedSessionId)  { toast.error("Please select a session"); return; }
    if (!subLevel?._id)      { toast.error("SubLevel not found"); return; }
    if (!level?._id)         { toast.error("Level not found"); return; }
    setSaving(true);
    try {
      await createSyllabusVersion({
        sessionId: selectedSessionId, levelId: level._id,
        subLevelId: subLevel._id,
        subjects: [buildSubjectPayload()],
      }).unwrap();
      toast.success("Subject saved to syllabus!");
      reset(); onSaved?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  useImperativeHandle(ref, () => ({ reset, save: handleSave }));

  return (
    <div className="space-y-4 px-1 py-2">
      {/* Session */}
      <div>
        <label className={lc}>Session <span className="text-red-400">*</span></label>
        <select className={ic} value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
          <option value="">-- Select Session --</option>
          {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className={lc}><MdBook size={12} className="inline mr-1 text-orange-400" />Subject <span className="text-red-400">*</span></label>
        <input className={ic} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. JavaScript" />
      </div>

      {/* Topics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={lc}><MdTopic size={12} className="inline mr-1 text-blue-400" />Topics</label>
          <button type="button" onClick={addTopic} className="text-xs text-orange-500 font-semibold bg-orange-50 px-2.5 py-1 rounded-lg">+ Add Topic</button>
        </div>
        {topics.map((topic, ti) => (
          <div key={ti} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
            <div className="flex items-center gap-2">
              <MdTopic size={14} className="text-blue-400 flex-shrink-0" />
              <input className={`${ic} flex-1`} value={topic.name} onChange={(e) => updateTopicName(ti, e.target.value)} placeholder={`Topic ${ti + 1}`} />
              {topics.length > 1 && (
                <button type="button" onClick={() => removeTopic(ti)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"><MdDelete size={15} /></button>
              )}
            </div>
            <div className="pl-5 space-y-1.5">
              {topic.subTopics.map((st, si) => (
                <div key={si} className="flex items-center gap-2">
                  <MdSubject size={12} className="text-gray-400 flex-shrink-0" />
                  <input className={`${ic} flex-1`} value={st} onChange={(e) => updateSubTopic(ti, si, e.target.value)} placeholder={`SubTopic ${si + 1}`} />
                  {topic.subTopics.length > 1 && (
                    <button type="button" onClick={() => removeSubTopic(ti, si)} className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0"><MdDelete size={13} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addSubTopic(ti)} className="text-xs text-blue-500 font-medium mt-1">+ Add SubTopic</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
ManualSyllabusForm.displayName = "ManualSyllabusForm";


export const SyllabusUploadDrawer = forwardRef(({ level, subLevel, onSaved }, ref) => {
  const fileRef = useRef(null);
  const [parsing,          setParsing]          = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [hierarchy,        setHierarchy]        = useState([]);
  const [fileName,         setFileName]         = useState("");
  const [selectedSessionId,setSelectedSessionId]= useState("");

  const [uploadCombined]        = useUploadCombinedSyllabusMutation();
  const { data: sessionsData }  = useGetAllSessionsQuery();
  const sessions = sessionsData?.data || [];

  const totalSubjects  = hierarchy.length;
  const totalTopics    = hierarchy.reduce((acc, s) => acc + s.topics.length, 0);
  const totalSubTopics = hierarchy.reduce((acc, s) => acc + s.topics.reduce((a, t) => a + (t.subTopics?.length || 0), 0), 0);
  const totalTasks     = hierarchy.reduce((acc, s) => acc + s.topics.reduce((a, t) => {
    const stTasks = (t.subTopics || []).filter(st => st.taskTitle).length;
    const topicTasks = (t.topicTasks || []).length;
    return a + stTasks + topicTasks;
  }, 0), 0);

  const reset = () => { setHierarchy([]); setFileName(""); setSelectedSessionId(""); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) { 
      toast.error("Please upload .xlsx, .xls or .csv file"); 
      return; 
    }
    setParsing(true); 
    setHierarchy([]); 
    setFileName(file.name);
    try {
      const rows = await parseExcel(file);
      if (!rows.length) { 
        toast.error("File is empty or has no data rows"); 
        return; 
      }
      
      // Validate required columns
      const firstRow = rows[0];
      const hasSubject = Object.keys(firstRow).some(key => 
        key.toLowerCase().includes('subject'));
      const hasTopic = Object.keys(firstRow).some(key => 
        key.toLowerCase().includes('topic'));
      
      if (!hasSubject || !hasTopic) {
        toast.error("Excel file must contain 'Subject' and 'Topic' columns");
        return;
      }
      
      const parsed = buildHierarchy(rows);
      if (!parsed.length) { 
        toast.error("No valid data found. Please check your Excel format and column names"); 
        return; 
      }
      setHierarchy(parsed);
      toast.success(`Parsed ${parsed.length} subject(s) successfully`);
    } catch (error) { 
      console.error('Excel parsing error:', error);
      toast.error("Failed to parse Excel file. Please check the file format"); 
    }
    finally { 
      setParsing(false); 
      e.target.value = ""; 
    }
  };

  const handleSave = async () => {
    if (!hierarchy.length)   { toast.error("No data to save"); return; }
    if (!subLevel?._id)      { toast.error("SubLevel not found"); return; }
    if (!level?._id)         { toast.error("Level not found"); return; }
    if (!selectedSessionId)  { toast.error("Please select a session"); return; }
    setSaving(true);
    try {
      const taskRows = buildTaskRows(hierarchy);
      console.log('Uploading syllabus data:', {
        sessionId: selectedSessionId,
        levelId: level._id,
        subLevelId: subLevel._id,
        tasks: taskRows
      });
      const res = await uploadCombined({
        sessionId:  selectedSessionId,
        levelId:    level._id,
        subLevelId: subLevel._id,
        tasks:      taskRows,
      }).unwrap();
      toast.success(res.message || "Syllabus + Tasks saved!");
      if (res.data?.errors?.length) {
        console.warn('Upload warnings:', res.data.errors);
        res.data.errors.forEach(e => toast.warn(e, { autoClose: 8000 }));
      }
      reset();
      onSaved?.();
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err?.data?.message || err?.message || "Failed to save";
      toast.error(errorMessage);
      if (err?.data?.errors?.length) {
        err.data.errors.forEach(e => toast.warn(e, { autoClose: 8000 }));
      }
    } finally { setSaving(false); }
  };

  useImperativeHandle(ref, () => ({ reset, save: handleSave }));

  return (
    <div className="space-y-4">
      <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-orange-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition group">
        {parsing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Parsing...</p>
          </div>
        ) : (
          <>
            <MdCloudUpload size={36} className="text-orange-300 group-hover:text-orange-400 transition mb-1" />
            <p className="text-sm font-semibold text-gray-700">Click to upload Excel file</p>
            <p className="text-xs text-gray-400 mt-0.5">Supports .xlsx, .xls and .csv</p>
            {fileName && <p className="mt-1.5 text-xs text-orange-500 font-medium">📄 {fileName}</p>}
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />

      <div className="p-3 bg-blue-50 rounded-lg space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-blue-600 font-semibold">Required columns:</p>
            <a
              href="/syllabus_template.csv"
              download="syllabus_template.csv"
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition"
            >
              ⬇ Download Template
            </a>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            {["Subject", "Topic Name", "SubTopic"].map((c) => (
              <span key={c} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Pehle sirf syllabus structure upload karo. Tasks baad mein <span className="font-semibold text-orange-500">Tasks Tab</span> se add kar sakte ho — topic pe directly ya subtopic select karke.
          </p>
        </div>
      </div>

      {hierarchy.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <MdCheckCircle size={16} className="text-green-500" />
            <span className="text-xs font-semibold text-gray-700">Parsed</span>
            <span className="text-xs text-gray-500">{totalSubjects} Subjects • {totalTopics} Topics • {totalSubTopics} SubTopics</span>
            {(() => {
              const tc = hierarchy.reduce((a, s) => a + s.topics.reduce((b, t) => b + t.subTopics.filter((st) => typeof st === "object" && st.taskTitle).length, 0), 0);
              return tc > 0 ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{tc} Tasks detected</span> : null;
            })()}
          </div>
          {/* Subject preview chips */}
          <div className="flex flex-wrap gap-1.5">
            {hierarchy.map((s) => (
              <span key={s.subject} className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-600">
                {s.subject} <span className="text-gray-400">({s.topics.length})</span>
              </span>
            ))}
          </div>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
          >
            <option value="">-- Select Session --</option>
            {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold py-2 rounded-lg transition">
              <MdSave size={15} />{saving ? "Saving..." : "Save Syllabus + Tasks"}
            </button>
            <button onClick={reset} className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {hierarchy.map((item, i) => <SubjectAccordion key={item.subject} item={item} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
});
SyllabusUploadDrawer.displayName = "SyllabusUploadDrawer";

/* ─── Topic/SubTopic table for one version ──────────────── */
const VersionTopicTable = ({ versionId, searchTerm, activeSubject }) => {
  const { data, isLoading } = useGetSyllabusVersionWithHierarchyQuery(versionId, { skip: !versionId });

  const rows = useMemo(() => {
    if (!data?.data?.subjects) return [];
    const result = [];
    data.data.subjects.forEach((subject) => {
      if (activeSubject && subject.name !== activeSubject) return;
      (subject.topics || []).forEach((topic) => {
        const topicIdStr = String(topic._id);
        if (topic.subTopics && topic.subTopics.length > 0) {
          topic.subTopics.forEach((st) => {
            result.push({ _id: String(st._id), subject: subject.name, topic: topic.name, subTopic: st.name, topicIdStr });
          });
        } else {
          result.push({ _id: topicIdStr, subject: subject.name, topic: topic.name, subTopic: "\u2014", topicIdStr });
        }
      });
    });
    return result;
  }, [data, activeSubject]);

  const subjects = useMemo(() => {
    if (!data?.data?.subjects) return [];
    return data.data.subjects.map((s) => s.name);
  }, [data]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((r) =>
      r.subject.toLowerCase().includes(q) ||
      r.topic.toLowerCase().includes(q) ||
      r.subTopic.toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!filtered.length) return <div className="py-10 text-center text-gray-400 text-sm">No topics found</div>;

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F8F7F5] border-b border-gray-100">
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">#</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Topic</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">SubTopic</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {filtered.map((row, idx) => {
            const showTopic = idx === 0 || filtered[idx - 1].topicIdStr !== row.topicIdStr;
            return (
              <tr key={`${row._id}-${idx}`} className="hover:bg-orange-50/40 transition-colors duration-150">
                <td className="px-5 py-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {showTopic ? (
                    <span className="flex items-center gap-1.5">
                      <MdTopic size={13} className="text-orange-400 flex-shrink-0" />
                      <span className="font-semibold text-gray-800 text-xs">{row.topic}</span>
                    </span>
                  ) : <span className="text-gray-200 text-xs pl-5">└</span>}
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1.5">
                    {row.subTopic !== "—" && <MdSubject size={12} className="text-gray-300 flex-shrink-0" />}
                    <span className="text-gray-600 text-xs">{row.subTopic}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-100 bg-[#F8F7F5]">
            <td colSpan={3} className="px-5 py-3 text-xs text-gray-400">
              Total <span className="font-semibold text-gray-600">{filtered.length}</span> entries
              {searchTerm && rows.length !== filtered.length && (
                <span className="ml-1">(filtered from {rows.length})</span>
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
};

/* helper: subjects list from version */
export const useSubjectsList = (versionId) => {
  const { data } = useGetSyllabusVersionWithHierarchyQuery(versionId, { skip: !versionId });
  return useMemo(() => (data?.data?.subjects || []).map((s) => ({ name: s.name, topicCount: s.topics?.length || 0 })), [data]);
};

/* ─── Task Excel Upload Drawer ─────────────────────────── */
const parseTaskExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(ws, { defval: "" }));
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

export const TaskUploadDrawer = ({ syllabusVersionId, subjectName, version, onSaved }) => {
  const fileRef = useRef(null);
  const [rows,     setRows]     = useState([]);
  const [fileName, setFileName] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [parsing,  setParsing]  = useState(false);

  const [bulkUploadTasks] = useBulkUploadTasksMutation();

  const reset = () => { setRows([]); setFileName(""); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) { 
      toast.error("Please upload .xlsx, .xls or .csv file"); 
      return; 
    }
    setParsing(true); 
    setRows([]); 
    setFileName(file.name);
    try {
      const parsed = await parseTaskExcel(file);
      if (!parsed.length) { 
        toast.error("Excel file is empty or has no data rows"); 
        return; 
      }
      
      // Validate required columns
      const firstRow = parsed[0];
      const hasTopic = Object.keys(firstRow).some(key => 
        key.toLowerCase().includes('topic'));
      const hasTask = Object.keys(firstRow).some(key => 
        key.toLowerCase().includes('task'));
      
      if (!hasTopic || !hasTask) {
        toast.error("Excel file must contain 'Topic' and 'Task Title' columns");
        return;
      }
      
      // Map column headers (case-insensitive)
      const mapped = parsed.map((r) => ({
        subject:           String(r["Subject"]          || r["subject"]          || r["SUBJECT"] || "").trim(),
        topic:             String(r["Topic"]            || r["topic"]            || r["Topic Name"] || r["TOPIC"] || "").trim(),
        subTopic:          String(r["Sub Topic"]        || r["subTopic"]         || r["SubTopic"]   || r["sub_topic"] || r["SUBTOPIC"] || "").trim(),
        taskTitle:         String(r["Task Title"]       || r["taskTitle"]        || r["TaskTitle"]  || r["Tasks"] || r["TASK"] || "").trim(),
        taskType:          String(r["taskType"]         || r["TaskType"]         || r["Task Type"]  || r["TASK TYPE"] || "assessment").trim(),
        priority:          String(r["priority"]         || r["Priority"]         || r["PRIORITY"] || "medium").trim(),
        maxMarks:          Number(r["maxMarks"]         || r["MaxMarks"]         || r["Max Marks"]  || r["MAX MARKS"] || 5),
        timeDays:          r["Time Days"] || r["timeDays"] || r["TimeDays"] || r["Time"] || r["TIME DAYS"] || null,
        measurablePoints:  String(r["Measurable Point"] || r["measurablePoints"] || r["MeasurablePoints"] || r["Measurable Points"] || r["MEASURABLE POINTS"] || "").trim(),
      })).filter((r) => r.topic && r.taskTitle);

      if (!mapped.length) { 
        toast.error("No valid task rows found. Check column names and ensure Topic and Task Title are filled."); 
        return; 
      }
      setRows(mapped);
      toast.success(`${mapped.length} task rows parsed successfully`);
    } catch (error) { 
      console.error('Task Excel parsing error:', error);
      toast.error("Failed to parse Excel file. Please check the file format"); 
    }
    finally { 
      setParsing(false); 
      e.target.value = ""; 
    }
  };

  const handleUpload = async () => {
    if (!rows.length) { toast.error("No data to upload"); return; }
    setSaving(true);
    try {
      const res = await bulkUploadTasks({ syllabusVersionId, tasks: rows }).unwrap();
      toast.success(`${res.inserted} task(s) uploaded!`);
      if (res.errors?.length) {
        console.warn('Task upload warnings:', res.errors);
        res.errors.forEach((e) => toast.warn(e, { autoClose: 8000 }));
      }
      reset();
      onSaved?.();
    } catch (err) {
      console.error('Task upload error:', err);
      const errData = err?.data;
      const errorMessage = errData?.message || err?.message || "Upload failed";
      toast.error(errorMessage);
      if (errData?.errors?.length) {
        errData.errors.forEach((e) => toast.warn(e, { autoClose: 8000 }));
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Upload Tasks for <span className="text-orange-600">{subjectName} {version}</span></p>
          <p className="text-xs text-gray-400 mt-0.5">Required columns: Subject, Topic, Sub Topic, Task Title, Time Days, Measurable Point</p>
        </div>
        <a
          href="/task_template.csv"
          download="task_template.csv"
          className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-semibold bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition"
        >
          ⬇ Download Template
        </a>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-orange-200 rounded-xl p-5 flex flex-col items-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition group"
      >
        {parsing ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Parsing...</span>
          </div>
        ) : (
          <>
            <MdAssignment size={28} className="text-orange-300 group-hover:text-orange-400 mb-1" />
            <p className="text-sm font-semibold text-gray-700">Click to upload Task Excel</p>
            {fileName && <p className="text-xs text-orange-500 mt-1">📄 {fileName}</p>}
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />

      {rows.length > 0 && (
        <>
          <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600">
            <span className="font-semibold text-green-600">{rows.length} rows</span> ready to upload
            <span className="ml-3 text-gray-400">Preview: {rows.slice(0, 2).map((r) => r.taskTitle).join(", ")}{rows.length > 2 ? "..." : ""}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              <MdSave size={15} />{saving ? "Uploading..." : "Upload Tasks"}
            </button>
            <button onClick={reset} className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Clear</button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── helper: numbered points ko split karo ──────────── */
const splitNumberedPoints = (text) => {
  if (!text) return [];
  // "1. abc\n2. def" ya "1. abc 2. def" dono handle karo
  const parts = text.split(/\n/).flatMap((line) =>
    line.split(/(?=\d+\.\s)/).map((s) => s.trim()).filter(Boolean)
  );
  return parts.length > 1 ? parts : [text.trim()];
};

/* ─── Tasks table for one version ──────────────────────── */
const PRIORITY_BADGE = {
  high:   { cls: "bg-red-100 text-red-600 border border-red-200",       dot: "bg-red-400" },
  medium: { cls: "bg-yellow-100 text-yellow-700 border border-yellow-200", dot: "bg-yellow-400" },
  low:    { cls: "bg-green-100 text-green-700 border border-green-200",   dot: "bg-green-400" },
};
const TYPE_BADGE = {
  writtenExam:  "bg-purple-50 text-purple-700 border border-purple-200",
  interview:    "bg-blue-50 text-blue-700 border border-blue-200",
  project:      "bg-orange-50 text-orange-600 border border-orange-200",
  presentation: "bg-pink-50 text-pink-700 border border-pink-200",
  learning:     "bg-teal-50 text-teal-700 border border-teal-200",
  assessment:   "bg-gray-100 text-gray-600 border border-gray-200",
};

export const VersionTasksTable = ({ versionId, searchTerm = "" }) => {
  const { data, isLoading } = useGetTasksBySyllabusVersionQuery(versionId, { skip: !versionId });
  const allTasks = data?.tasks || data?.data || [];

  const tasks = useMemo(() => {
    if (!searchTerm.trim()) return allTasks;
    const q = searchTerm.toLowerCase();
    return allTasks.filter((t) =>
      t.title?.toLowerCase().includes(q) ||
      t.topicName?.toLowerCase().includes(q) ||
      t.subTopicName?.toLowerCase().includes(q)
    );
  }, [allTasks, searchTerm]);

  if (isLoading) return (
    <div className="flex justify-center py-14">
      <div className="w-7 h-7 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!tasks.length) return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
        <MdAssignment size={30} className="text-orange-300" />
      </div>
      <p className="text-sm font-semibold text-gray-500">No tasks added yet</p>
      <p className="text-xs text-gray-400 mt-1">Add tasks from the button above</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[820px]">
        <thead>
          <tr className="bg-[#F8F7F5] border-b border-gray-100">
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">#</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Task Title</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Topic / SubTopic</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Measurable Points</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {tasks.map((task, idx) => {
            const measurePoints = splitNumberedPoints(task.measurablePoints);
            const priorityKey   = (task.priority || "medium").toLowerCase();
            const typeKey       = task.type || "assessment";
            const pBadge        = PRIORITY_BADGE[priorityKey] || PRIORITY_BADGE.medium;
            return (
              <tr key={task._id} className="hover:bg-orange-50/40 transition-colors duration-150 align-top">

                {/* # */}
                <td className="px-5 py-4">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </td>

                {/* Task Title */}
                <td className="px-5 py-4 max-w-[210px]">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{task.title}</p>
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                      📅 {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  )}
                </td>

                {/* Topic / SubTopic */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <MdTopic size={13} className="text-orange-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-700">{task.topicName || "—"}</span>
                  </div>
                  {task.subTopicName && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <MdSubject size={12} className="text-gray-300 flex-shrink-0" />
                      <span className="text-xs text-gray-500">{task.subTopicName}</span>
                    </div>
                  )}
                </td>

                {/* Type */}
                <td className="px-5 py-4">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${TYPE_BADGE[typeKey] || "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                    {typeKey}
                  </span>
                </td>

                {/* Priority */}
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${pBadge.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pBadge.dot}`} />
                    {priorityKey}
                  </span>
                </td>

                {/* Time */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {task.timeDays ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                      ⏱ {task.timeDays} <span className="font-normal text-gray-400">day{task.timeDays > 1 ? "s" : ""}</span>
                    </span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>

                {/* Measurable Points */}
                <td className="px-5 py-4 max-w-[230px]">
                  {measurePoints.length > 0 && measurePoints[0] ? (
                    <ul className="space-y-1">
                      {measurePoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>

              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-100 bg-[#F8F7F5]">
            <td colSpan={7} className="px-5 py-3 text-xs text-gray-400">
              Total <span className="font-semibold text-gray-600">{tasks.length}</span> tasks
              {searchTerm && allTasks.length !== tasks.length && (
                <span className="ml-1 text-gray-400">(filtered from {allTasks.length})</span>
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

/* ─── Manual Task Creation Form ────────────────────────── */
const TASK_TYPES = ["writtenExam", "interview", "project", "presentation", "learning", "assessment"];
const EMPTY_FORM = { title: "", measurablePoints: "", timeDays: "", type: "assessment", dueDate: "" };

export const ManualTaskForm = ({ subLevel, versionId, onSaved, formId = "manual-task-form", showSubmitButton = true }) => {
  const subLevelId = subLevel?._id;
  const [syllabusVersionId, setSyllabusVersionId] = useState(versionId || "");
  const [subjectId,  setSubjectId]  = useState("");
  const [topicId,    setTopicId]    = useState("");
  const [taskTarget, setTaskTarget] = useState("");
  const [subTopicId, setSubTopicId] = useState("");
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  const { data: versionsData } = useGetSyllabusVersionsBySubLevelQuery(
    { subLevelId, sessionId: "" },
    { skip: !subLevelId && !versionId }
  );
  const versions = versionsData?.data || [];

  useEffect(() => {
    if (!versionId && versions.length > 0) {
      const active = versions.find((v) => v.status === "active") || versions[0];
      setSyllabusVersionId(active._id);
    }
  }, [versions, versionId]);

  const { data: versionDetail } = useGetSyllabusVersionWithHierarchyQuery(syllabusVersionId, { skip: !syllabusVersionId });
  const subjects  = versionDetail?.data?.subjects || [];
  const topics    = subjects.find((s) => s._id === subjectId)?.topics || [];
  const subTopics = topics.find((t) => t._id === topicId)?.subTopics || [];

  const [createTask] = useCreateTaskManualMutation();
  const resetForm = () => { setSubjectId(""); setTopicId(""); setTaskTarget(""); setSubTopicId(""); setForm(EMPTY_FORM); };
  const canSubmit = taskTarget === "topic" || (taskTarget === "subtopic" && subTopicId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Task title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        syllabusVersionId, subjectId, topicId,
        ...(taskTarget === "subtopic" && subTopicId ? { subTopicId } : {}),
        ...form,
        title:    form.title.trim(),
        timeDays: form.timeDays ? Number(form.timeDays) : null,
      };
      await createTask(payload).unwrap();
      toast.success("Task created successfully!");
      setForm(EMPTY_FORM); setSubTopicId(""); setTaskTarget("");
      onSaved?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create task");
    } finally { setSaving(false); }
  };

  const ic = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white transition";
  const lc = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <form id={formId} onSubmit={handleSubmit} className="divide-y divide-gray-100">

      {/* Section 1 */}
      <div className="px-5 py-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Location</span>
        </div>

        <div>
          <label className={lc}>Subject</label>
          <select className={ic} value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId(""); setTaskTarget(""); setSubTopicId(""); }}>
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {subjectId && (
          <div>
            <label className={lc}>Topic</label>
            <select className={ic} value={topicId} onChange={(e) => { setTopicId(e.target.value); setTaskTarget(""); setSubTopicId(""); }}>
              <option value="">-- Select Topic --</option>
              {topics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
        )}

        {topicId && (
          <div>
            <label className={lc}>Assign Task To</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button"
                onClick={() => { setTaskTarget("topic"); setSubTopicId(""); }}
                className={`flex items-center gap-2.5 border rounded-xl px-3 py-2.5 transition text-left ${taskTarget === "topic" ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 bg-white text-gray-500 hover:border-orange-300"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${taskTarget === "topic" ? "bg-orange-100" : "bg-gray-100"}`}>
                  <MdTopic size={16} className={taskTarget === "topic" ? "text-orange-500" : "text-gray-400"} />
                </div>
                <div>
                  <p className="text-xs font-semibold">Topic Level</p>
                  <p className="text-[10px] opacity-60">No subtopic</p>
                </div>
              </button>
              <button type="button"
                onClick={() => setTaskTarget("subtopic")}
                className={`flex items-center gap-2.5 border rounded-xl px-3 py-2.5 transition text-left ${taskTarget === "subtopic" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 bg-white text-gray-500 hover:border-blue-300"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${taskTarget === "subtopic" ? "bg-blue-100" : "bg-gray-100"}`}>
                  <MdSubject size={16} className={taskTarget === "subtopic" ? "text-blue-500" : "text-gray-400"} />
                </div>
                <div>
                  <p className="text-xs font-semibold">SubTopic Level</p>
                  <p className="text-[10px] opacity-60">Select subtopic</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {taskTarget === "subtopic" && (
          <div>
            <label className={lc}>SubTopic</label>
            {subTopics.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                No subtopics found in this topic. Select Topic Level instead.
              </div>
            ) : (
              <select className={ic} value={subTopicId} onChange={(e) => setSubTopicId(e.target.value)}>
                <option value="">-- Select SubTopic --</option>
                {subTopics.map((st) => <option key={st._id} value={st._id}>{st.name}</option>)}
              </select>
            )}
          </div>
        )}

        {canSubmit && (
          <div className="flex items-center gap-1.5 flex-wrap bg-[#F8F7F5] border border-gray-100 rounded-xl px-3 py-2.5">
            <MdBook size={12} className="text-orange-400" />
            <span className="text-xs font-medium text-gray-600">{subjects.find(s => s._id === subjectId)?.name}</span>
            <span className="text-gray-300 text-xs">â€º</span>
            <MdTopic size={12} className="text-orange-400" />
            <span className="text-xs font-medium text-gray-600">{topics.find(t => t._id === topicId)?.name}</span>
            {subTopicId && (<><span className="text-gray-300 text-xs">â€º</span><MdSubject size={12} className="text-gray-400" /><span className="text-xs text-gray-500">{subTopics.find(s => s._id === subTopicId)?.name}</span></>)}
            <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${taskTarget === "subtopic" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
              {taskTarget === "subtopic" ? "SubTopic" : "Topic"}
            </span>
          </div>
        )}
      </div>

      {/* Section 2 */}
      {canSubmit && (
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Task Details</span>
          </div>

          <div>
            <label className={lc}>Task Title <span className="text-red-400 normal-case font-normal">*</span></label>
            <input className={ic} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Build a REST API" />
          </div>

          <div>
            <label className={lc}>Measurable Points</label>
            <textarea className={ic} rows={3} value={form.measurablePoints} onChange={(e) => setForm((p) => ({ ...p, measurablePoints: e.target.value }))} placeholder="e.g. Student should be able to explain and implement..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lc}>Type</label>
              <select className={ic} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Time (Days)</label>
              <input type="number" className={ic} value={form.timeDays} onChange={(e) => setForm((p) => ({ ...p, timeDays: e.target.value }))} placeholder="e.g. 7" />
            </div>
            <div className="col-span-2">
              <label className={lc}>Due Date <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
              <input type="date" className={ic} value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {canSubmit && (
        <div className="px-5 py-4 flex gap-2 bg-[#F8F7F5]">
          {showSubmitButton && (
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-sm shadow-orange-100">
              <MdAssignment size={15} />
              {saving ? "Saving..." : "Add Task"}
            </button>
          )}
          <button type="button" onClick={resetForm}
            className="px-4 py-2.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Reset
          </button>
        </div>
      )}
    </form>
  );
};

/* --- Tasks Tab ----------------------------------------- */
export const TasksTab = ({ level, subLevel, onVersionChange }) => {
  const subLevelId = subLevel?._id;
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [activeVersionId,   setActiveVersionId]   = useState("");
  const [searchTerm,        setSearchTerm]        = useState("");
  const [showTaskModal,     setShowTaskModal]     = useState(false);

  const { data: sessionsData } = useGetAllSessionsQuery();
  const sessions = sessionsData?.data || [];

  const { data: versionsData, refetch } = useGetSyllabusVersionsBySubLevelQuery(
    { subLevelId, sessionId: selectedSessionId },
    { skip: !subLevelId, refetchOnMountOrArgChange: true }
  );
  const allVersions = versionsData?.data || [];

  const currentVersionId = activeVersionId
    || allVersions.find((v) => v.status === "active")?._id
    || allVersions[0]?._id
    || "";

  useEffect(() => { onVersionChange?.(currentVersionId); }, [currentVersionId]);

  if (!subLevelId) return <div className="py-16 text-center text-gray-400 text-sm">SubLevel not found</div>;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Top bar: search + session filter + Add Task button */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title, topic..."
            className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
          />
          <select
            value={selectedSessionId}
            onChange={(e) => { setSelectedSessionId(e.target.value); setActiveVersionId(""); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white min-w-[160px]"
          >
            <option value="">All Sessions</option>
            {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <MdAdd size={16} />
            Add Task
          </button>
        </div>

      {/* Version tabs */}
      {allVersions.length > 1 && (
        <div className="flex gap-0 overflow-x-auto border-b border-gray-100">
          {allVersions.map((v) => (
            <button
              key={v._id}
              onClick={() => setActiveVersionId(v._id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                currentVersionId === v._id
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MdBook size={13} className={currentVersionId === v._id ? "text-orange-500" : "text-gray-400"} />
              <span>{v.title || v.version}</span>
            </button>
          ))}
        </div>
      )}

        {/* Table or empty state */}
        {allVersions.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
              <MdAssignment size={26} className="text-orange-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No syllabus found</p>
            <p className="text-xs text-gray-400 mt-1">{selectedSessionId ? "Try a different session" : "Upload syllabus first from Syllabus tab"}</p>
          </div>
        ) : (
          <VersionTasksTable versionId={currentVersionId} searchTerm={searchTerm} />
        )}
      </div>

      {/* Task Management Modal */}
      <TaskManagementModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        level={level}
        subLevel={subLevel}
        onSuccess={() => {
          setShowTaskModal(false);
          refetch();
        }}
      />
    </>
  );
};
const EmptyUploadState = ({ level, subLevel, onSaved }) => {
  const [showUpload, setShowUpload] = useState(false);
  const drawerRef = useRef(null);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
        <MdCloudUpload size={44} className="text-orange-400" />
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-2">No syllabus uploaded for this level.</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
        Upload the academic syllabus to get started. Once uploaded, you can assign lessons to specific weeks and track coverage.
      </p>

      {!showUpload ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition hover:shadow-md"
          >
            <MdCloudUpload size={16} /> Upload Syllabus
          </button>
          <a
            href="/syllabus_template.csv"
            download="syllabus_template.csv"
            className="flex items-center gap-2 text-sm font-semibold text-orange-500 bg-white border border-orange-300 hover:bg-orange-50 px-6 py-2.5 rounded-xl transition"
          >
            ⬇ Browse Template
          </a>
        </div>
      ) : (
        <div className="w-full max-w-md text-left mt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Upload Syllabus</span>
            <button
              onClick={() => { setShowUpload(false); drawerRef.current?.reset(); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ✕ Cancel
            </button>
          </div>
          <SyllabusUploadDrawer
            ref={drawerRef}
            level={level}
            subLevel={subLevel}
            onSaved={() => { setShowUpload(false); onSaved?.(); }}
          />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN SYLLABUS TAB
══════════════════════════════════════════════════════════ */
const SyllabusTab = ({ level, subLevel }) => {
  const subLevelId = subLevel?._id;

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [activeVersionId,   setActiveVersionId]   = useState("");
  const [searchTerm,        setSearchTerm]        = useState("");
  const [activeSubject,     setActiveSubject]     = useState("");

  const { data: sessionsData } = useGetAllSessionsQuery();
  const sessions = sessionsData?.data || [];

  const { data: versionsData, refetch } = useGetSyllabusVersionsBySubLevelQuery(
    { subLevelId, sessionId: selectedSessionId },
    { skip: !subLevelId, refetchOnMountOrArgChange: true }
  );
  const allVersions = versionsData?.data || [];

  const currentVersionId = activeVersionId
    || allVersions.find((v) => v.status === "active")?._id
    || allVersions[0]?._id
    || "";

  const currentVersionDoc = allVersions.find((v) => v._id === currentVersionId);

  // subjects list for current version
  const subjectsList = useSubjectsList(currentVersionId);

  // auto-select first subject when version changes
  useEffect(() => {
    if (subjectsList.length > 0) setActiveSubject(subjectsList[0].name);
    else setActiveSubject("");
  }, [currentVersionId, subjectsList.length]);

  const [deleteSyllabusVersion]   = useDeleteSyllabusVersionMutation();
  const [activateSyllabusVersion] = useActivateSyllabusVersionMutation();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this version?")) return;
    try { await deleteSyllabusVersion(id).unwrap(); refetch(); }
    catch (err) { toast.error(err?.data?.message || "Delete failed"); }
  };

  const handleActivate = async (id) => {
    try { await activateSyllabusVersion(id).unwrap(); toast.success("Activated!"); refetch(); }
    catch (err) { toast.error(err?.data?.message || "Activate failed"); }
  };

  if (allVersions.length === 0 && !selectedSessionId) {
    return <EmptyUploadState level={level} subLevel={subLevel} onSaved={refetch} />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Top bar: search + session */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
        <input
          type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search topic or subtopic..."
          className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
        />
        <select
          value={selectedSessionId}
          onChange={(e) => { setSelectedSessionId(e.target.value); setActiveVersionId(""); setSearchTerm(""); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white min-w-[160px]"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Version tabs — sirf multiple versions hone par */}
      {allVersions.length > 1 && (
        <div className="flex gap-0 overflow-x-auto border-b border-gray-100">
          {allVersions.map((v) => (
            <button
              key={v._id}
              onClick={() => { setActiveVersionId(v._id); setSearchTerm(""); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                currentVersionId === v._id
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MdBook size={13} className={currentVersionId === v._id ? "text-orange-500" : "text-gray-400"} />
              <span>{v.title || v.version}</span>
            </button>
          ))}
        </div>
      )}

      {/* Version status bar */}
      {currentVersionDoc && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#F8F7F5] border-b border-gray-100 flex-wrap">
          <StatusBadge status={currentVersionDoc.status} />
          <span className="text-xs text-gray-400">Session: {currentVersionDoc.sessionId?.name || "—"}</span>
          <div className="flex items-center gap-2 ml-auto">
            {currentVersionDoc.status === "draft" && (
              <button onClick={() => handleActivate(currentVersionDoc._id)} className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-semibold transition border border-green-200">Activate</button>
            )}
            {currentVersionDoc.status !== "active" && (
              <button onClick={() => handleDelete(currentVersionDoc._id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                <MdDelete size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Subject tabs */}
      {subjectsList.length > 0 && (
        <div className="flex gap-0 overflow-x-auto border-b border-gray-100 bg-white">
          {subjectsList.map((s) => (
            <button
              key={s.name}
              onClick={() => { setActiveSubject(s.name); setSearchTerm(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                activeSubject === s.name
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MdBook size={13} className={activeSubject === s.name ? "text-orange-500" : "text-gray-400"} />
              <span>{s.name}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {s.topicCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {allVersions.length === 0 ? (
        <div className="py-14 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
            <MdBook size={26} className="text-orange-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No syllabus found</p>
          <p className="text-xs text-gray-400 mt-1">{selectedSessionId ? "Try a different session" : "Upload syllabus first"}</p>
        </div>
      ) : (
        <VersionTopicTable versionId={currentVersionId} searchTerm={searchTerm} activeSubject={activeSubject} />
      )}

    </div>
  );
};
export default SyllabusTab;
