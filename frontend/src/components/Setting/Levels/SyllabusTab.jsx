import { useState, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import * as XLSX from "xlsx";
import {
  MdCloudUpload, MdCheckCircle, MdExpandMore, MdExpandLess,
  MdBook, MdTopic, MdSubject, MdDelete, MdSave, MdEdit, MdVisibility,
  MdAssignment, MdPriorityHigh,
} from "react-icons/md";
import { toast } from "react-toastify";
import {
  useCreateSyllabusVersionMutation,
  useGetSyllabusVersionsBySubLevelQuery,
  useGetSyllabusVersionWithHierarchyQuery,
  useDeleteSyllabusVersionMutation,
  useApproveSyllabusVersionMutation,
  useActivateSyllabusVersionMutation,
  useGetAllSessionsQuery,
  useGetTasksBySyllabusVersionQuery,
  useBulkUploadTaskMasterMutation,
} from "../../../redux/api/authApi";

/* ─── helpers ─────────────────────────────────────────── */
const normalize = (v) => (v === undefined || v === null ? "" : String(v).trim());

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
    const subject      = normalize(row["Subject"]    || row["subject"]);
    const topic        = normalize(row["Topic Name"] || row["Topic"] || row["topic"]);
    const subTopicName = normalize(row["SubTopic"]   || row["subtopic"] || row["sub_topic"]);
    if (!subject) return;
    if (!subjectMap.has(subject)) subjectMap.set(subject, new Map());
    const topicMap = subjectMap.get(subject);
    if (!topic) return;
    if (!topicMap.has(topic)) topicMap.set(topic, []);
    if (!subTopicName) return;
    const stList = topicMap.get(topic);

    const taskTitle       = normalize(row["Tasks"]             || row["TaskTitle"]       || row["taskTitle"]);
    const timeDays        = normalize(row["Time"]              || row["timeDays"]        || row["time"]);
    const measurablePoints= normalize(row["Measurable Point"]  || row["measurablePoints"]|| row["Measurable Points"]);
    const taskDescription = normalize(row["TaskDescription"]   || row["Task Description"]|| row["taskDescription"]);
    const taskType        = normalize(row["TaskType"]          || row["Task Type"]       || row["taskType"]);
    const maxMarks        = normalize(row["MaxMarks"]          || row["Max Marks"]       || row["maxMarks"]);
    const cutoff          = normalize(row["Cutoff"]            || row["cutoff"]);
    const priority        = normalize(row["Priority"]          || row["priority"]);
    const mandatory       = normalize(row["Mandatory"]         || row["mandatory"]);

    stList.push({
      name: subTopicName,
      ...(taskTitle ? {
        taskTitle,
        timeDays:         timeDays || null,
        measurablePoints: measurablePoints || null,
        taskDescription,
        taskType:  taskType  || "assessment",
        maxMarks:  maxMarks  || "100",
        cutoff:    cutoff    || "40",
        priority:  priority  || "medium",
        mandatory: mandatory !== "false" && mandatory !== "0",
      } : {}),
    });
  });
  return Array.from(subjectMap.entries()).map(([subjectName, topicMap]) => ({
    subject: subjectName,
    topics: Array.from(topicMap.entries()).map(([topicName, stList]) => ({
      topic: topicName,
      subTopics: stList,
    })),
  }));
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
   UPLOAD DRAWER
══════════════════════════════════════════════════════════ */
export const SyllabusUploadDrawer = forwardRef(({ level, subLevel, onSaved }, ref) => {
  const fileRef = useRef(null);
  const [parsing,          setParsing]          = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [hierarchy,        setHierarchy]        = useState([]);
  const [fileName,         setFileName]         = useState("");
  const [version,          setVersion]          = useState("");
  const [selectedSessionId,setSelectedSessionId]= useState("");

  const [createSyllabusVersion] = useCreateSyllabusVersionMutation();
  const { data: sessionsData }  = useGetAllSessionsQuery();
  const sessions = sessionsData?.data || [];

  const totalSubjects  = hierarchy.length;
  const totalTopics    = hierarchy.reduce((acc, s) => acc + s.topics.length, 0);
  const totalSubTopics = hierarchy.reduce((acc, s) => acc + s.topics.reduce((a, t) => a + t.subTopics.length, 0), 0);

  const reset = () => { setHierarchy([]); setFileName(""); setVersion(""); };
  useImperativeHandle(ref, () => ({ reset }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) { toast.error("Please upload .xlsx or .xls file"); return; }
    setParsing(true); setHierarchy([]); setFileName(file.name);
    try {
      const rows = await parseExcel(file);
      if (!rows.length) { toast.error("Excel file is empty"); return; }
      const parsed = buildHierarchy(rows);
      if (!parsed.length) { toast.error("No valid data. Columns needed: Subject, Topic Name, SubTopic"); return; }
      setHierarchy(parsed);
      toast.success(`Parsed ${parsed.length} subject(s)`);
    } catch { toast.error("Failed to parse Excel file"); }
    finally { setParsing(false); e.target.value = ""; }
  };

  const handleSave = async () => {
    if (!hierarchy.length)   { toast.error("No data to save"); return; }
    if (!version.trim())     { toast.error("Please enter a version name (e.g. v1.0)"); return; }
    if (!subLevel?._id)      { toast.error("SubLevel not found"); return; }
    if (!level?._id)         { toast.error("Level not found"); return; }
    if (!selectedSessionId)  { toast.error("Please select a session"); return; }
    setSaving(true);
    try {
      await createSyllabusVersion({
        sessionId: selectedSessionId,
        levelId: level._id,
        subLevelId: subLevel._id,
        version: version.trim(),
        hierarchy,
      }).unwrap();
      const taskCount = hierarchy.reduce((a, s) => a + s.topics.reduce((b, t) => b + t.subTopics.filter((st) => typeof st === "object" && st.taskTitle).length, 0), 0);
      toast.success(`${hierarchy.length} subject(s) syllabus saved!${taskCount > 0 ? ` + ${taskCount} task(s) bhi save ho gaye!` : ""}`);
      reset();
      onSaved?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save syllabus");
    } finally { setSaving(false); }
  };

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
            <p className="text-xs text-gray-400 mt-0.5">Supports .xlsx and .xls</p>
            {fileName && <p className="mt-1.5 text-xs text-orange-500 font-medium">📄 {fileName}</p>}
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />

      <div className="p-3 bg-blue-50 rounded-lg space-y-2">
        <div>
          <p className="text-xs text-blue-600 font-semibold mb-1">Required columns:</p>
          <div className="flex gap-2 flex-wrap text-xs">
            {["Subject", "Topic Name", "SubTopic"].map((c) => (
              <span key={c} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-green-600 font-semibold mb-1">Task columns (optional):</p>
          <div className="flex gap-2 flex-wrap text-xs">
            {["Tasks", "Time", "Measurable Point"].map((c) => (
              <span key={c} className="bg-green-100 text-green-600 px-2 py-0.5 rounded">{c}</span>
            ))}
          </div>
          <p className="text-xs text-green-500 mt-1">Tasks column hoga to syllabus ke saath tasks bhi automatically save honge. Time = days mein.</p>
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
          <input
            type="text" value={version} onChange={(e) => setVersion(e.target.value)}
            placeholder="Version name (e.g. v1.0)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
          />
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
const VersionTopicTable = ({ versionId, searchTerm }) => {
  const { data, isLoading } = useGetSyllabusVersionWithHierarchyQuery(versionId, { skip: !versionId });

  const rows = useMemo(() => {
    if (!data?.data?.subjects) return [];
    const result = [];
    data.data.subjects.forEach((subject) => {
      (subject.topics || []).forEach((topic) => {
        const topicIdStr = String(topic._id);
        if (topic.subTopics && topic.subTopics.length > 0) {
          topic.subTopics.forEach((st) => {
            result.push({ _id: String(st._id), subject: subject.name, topic: topic.name, subTopic: st.name, topicIdStr });
          });
        } else {
          result.push({ _id: topicIdStr, subject: subject.name, topic: topic.name, subTopic: "—", topicIdStr });
        }
      });
    });
    return result;
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
      <div className="w-7 h-7 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!filtered.length) return <div className="py-10 text-center text-gray-400 text-sm">No subtopics found</div>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">SubTopic</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {filtered.map((row, idx) => {
          const showSubject = idx === 0 || filtered[idx - 1].subject !== row.subject;
          const showTopic   = idx === 0 || filtered[idx - 1].topicIdStr !== row.topicIdStr;
          return (
            <tr key={`${row._id}-${idx}`} className="hover:bg-gray-50 transition">
              <td className="px-4 py-2.5 text-xs text-gray-400">{idx + 1}</td>
              <td className="px-4 py-2.5">
                {showSubject ? (
                  <span className="flex items-center gap-1.5">
                    <MdBook size={13} className="text-orange-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-800 text-xs">{row.subject}</span>
                  </span>
                ) : <span className="text-gray-200 text-xs pl-5">│</span>}
              </td>
              <td className="px-4 py-2.5">
                {showTopic ? (
                  <span className="flex items-center gap-1.5">
                    <MdTopic size={13} className="text-blue-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700 text-xs">{row.topic}</span>
                  </span>
                ) : <span className="text-gray-300 text-xs pl-5">↳</span>}
              </td>
              <td className="px-4 py-2.5">
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
        <tr className="border-t border-gray-100 bg-gray-50">
          <td colSpan={4} className="px-4 py-2 text-xs text-gray-400">{filtered.length} entries</td>
        </tr>
      </tfoot>
    </table>
  );
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

  const [bulkUploadTasks] = useBulkUploadTaskMasterMutation();

  const reset = () => { setRows([]); setFileName(""); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) { toast.error("Please upload .xlsx or .xls file"); return; }
    setParsing(true); setRows([]); setFileName(file.name);
    try {
      const parsed = await parseTaskExcel(file);
      if (!parsed.length) { toast.error("Excel file is empty"); return; }
      // Map column headers (case-insensitive)
      const mapped = parsed.map((r) => ({
        subject:     String(r["Subject"]     || r["subject"]     || "").trim(),
        topic:       String(r["Topic"]       || r["topic"]       || "").trim(),
        subTopic:    String(r["SubTopic"]    || r["subtopic"]    || r["sub_topic"] || "").trim(),
        taskTitle:   String(r["TaskTitle"]   || r["Task Title"]  || r["taskTitle"] || "").trim(),
        taskType:    String(r["TaskType"]    || r["Task Type"]   || r["taskType"]  || "assessment").trim(),
        maxMarks:    r["MaxMarks"]   || r["Max Marks"]  || r["maxMarks"]  || 100,
        cutoff:      r["Cutoff"]     || r["cutoff"]     || 40,
        priority:    String(r["Priority"]    || r["priority"]    || "medium").trim(),
        mandatory:   String(r["Mandatory"]   || r["mandatory"]   || "true").trim(),
        description: String(r["Description"] || r["description"] || "").trim(),
      })).filter((r) => r.topic && r.subTopic && r.taskTitle);

      if (!mapped.length) { toast.error("No valid rows found. Check column names."); return; }
      setRows(mapped);
      toast.success(`${mapped.length} task rows parsed`);
    } catch { toast.error("Failed to parse Excel"); }
    finally { setParsing(false); e.target.value = ""; }
  };

  const handleUpload = async () => {
    if (!rows.length) { toast.error("No data to upload"); return; }
    setSaving(true);
    try {
      const res = await bulkUploadTasks({ syllabusVersionId, tasks: rows }).unwrap();
      toast.success(`${res.inserted} task(s) uploaded!`);
      if (res.errors?.length) {
        res.errors.forEach((e) => toast.warn(e, { autoClose: 8000 }));
      }
      reset();
      onSaved?.();
    } catch (err) {
      const errData = err?.data;
      toast.error(errData?.message || "Upload failed");
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
          <p className="text-xs text-gray-400 mt-0.5">Required columns: Topic, SubTopic, TaskTitle</p>
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
      <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />

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
const PRIORITY_STYLE = {
  low:    "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high:   "bg-red-100 text-red-700",
};
const TYPE_STYLE = {
  writtenExam:  "bg-purple-100 text-purple-700",
  interview:    "bg-blue-100 text-blue-700",
  project:      "bg-orange-100 text-orange-700",
  presentation: "bg-pink-100 text-pink-700",
  learning:     "bg-teal-100 text-teal-700",
  assessment:   "bg-gray-100 text-gray-700",
};

export const VersionTasksTable = ({ versionId }) => {
  const { data, isLoading } = useGetTasksBySyllabusVersionQuery(versionId, { skip: !versionId });
  const tasks = data?.tasks || data?.data || [];

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!tasks.length) return (
    <div className="py-12 text-center">
      <MdAssignment size={36} className="text-gray-200 mx-auto mb-2" />
      <p className="text-sm text-gray-400">No tasks found for this version</p>
    </div>
  );

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic / SubTopic</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Measurable Point</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {tasks.map((task, idx) => {
          const titlePoints = splitNumberedPoints(task.title);
          const measurePoints = splitNumberedPoints(task.measurablePoints);
          return (
          <tr key={task._id} className="hover:bg-gray-50 transition align-top">
            <td className="px-4 py-2.5 text-xs text-gray-400">{idx + 1}</td>
            <td className="px-4 py-2.5">
              <ol className="space-y-0.5 list-none">
                {titlePoints.map((point, i) => (
                  <li key={i} className="text-xs text-gray-800">{point}</li>
                ))}
              </ol>
            </td>
            <td className="px-4 py-2.5">
              <p className="text-xs text-gray-600">{task.topicId?.name || "—"}</p>
              <p className="text-xs text-gray-400">{task.subTopicId?.name || ""}</p>
            </td>
            <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">
              {task.timeDays ? `${task.timeDays} Day${task.timeDays > 1 ? "s" : ""}` : "—"}
            </td>
            <td className="px-4 py-2.5 max-w-[240px]">
              <ol className="space-y-0.5 list-none">
                {measurePoints.map((point, i) => (
                  <li key={i} className="text-xs text-gray-500">{point}</li>
                ))}
              </ol>
            </td>
          </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr className="border-t border-gray-100 bg-gray-50">
          <td colSpan={5} className="px-4 py-2 text-xs text-gray-400">{tasks.length} tasks</td>
        </tr>
      </tfoot>
    </table>
  );
};

/* ─── Tasks Tab with session+subject selector ──────────── */
export const TasksTab = ({ level, subLevel }) => {
  const subLevelId = subLevel?._id;
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [activeSubject,     setActiveSubject]     = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState({});

  const { data: sessionsData } = useGetAllSessionsQuery();
  const sessions = sessionsData?.data || [];

  const { data: versionsData } = useGetSyllabusVersionsBySubLevelQuery(
    { subLevelId, sessionId: selectedSessionId },
    { skip: !subLevelId, refetchOnMountOrArgChange: true }
  );
  const allVersions = versionsData?.data || [];

  const grouped = useMemo(() => {
    const g = {};
    allVersions.forEach((v) => {
      if (!g[v.subjectName]) g[v.subjectName] = [];
      g[v.subjectName].push(v);
    });
    return g;
  }, [allVersions]);

  const subjectNames = Object.keys(grouped).sort();
  const currentSubject = activeSubject && grouped[activeSubject] ? activeSubject : subjectNames[0] || "";
  const subjectVersions = grouped[currentSubject] || [];
  const activeVersionId = selectedVersionId[currentSubject]
    || subjectVersions.find((v) => v.status === "active")?._id
    || subjectVersions[0]?._id
    || "";

  if (!subLevelId) return <div className="py-16 text-center text-gray-400 text-sm">SubLevel not found</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
        <select
          value={selectedSessionId}
          onChange={(e) => { setSelectedSessionId(e.target.value); setActiveSubject(""); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white min-w-[160px]"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {allVersions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center text-gray-400 text-sm">
          No syllabus found{selectedSessionId ? " for this session" : ". Upload syllabus first."}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex gap-0 overflow-x-auto border-b border-gray-100">
            {subjectNames.map((name) => (
              <button
                key={name}
                onClick={() => setActiveSubject(name)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  currentSubject === name
                    ? "border-orange-500 text-orange-600 bg-orange-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MdBook size={15} className={currentSubject === name ? "text-orange-500" : "text-gray-400"} />
                {name}
              </button>
            ))}
          </div>

          {subjectVersions.length > 1 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Version:</span>
              <select
                value={activeVersionId}
                onChange={(e) => setSelectedVersionId((p) => ({ ...p, [currentSubject]: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400 bg-white"
              >
                {subjectVersions.map((v) => (
                  <option key={v._id} value={v._id}>
                    {currentSubject} {v.version} — {v.status}{v.status === "active" ? " ✓" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <VersionTasksTable versionId={activeVersionId} />
        </div>
      )}
    </div>
  );
};

/* ─── Inner content: Syllabus only ─────────────────────── */
const InnerTabs = ({ versionId, searchTerm }) => (
  <VersionTopicTable versionId={versionId} searchTerm={searchTerm} />
);

/* ══════════════════════════════════════════════════════════
   EMPTY STATE WITH INLINE UPLOAD
══════════════════════════════════════════════════════════ */
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
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition hover:shadow-md"
        >
          <MdCloudUpload size={16} /> Upload Syllabus
        </button>
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
  const [activeSubject,     setActiveSubject]     = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState({});
  const [searchTerm,        setSearchTerm]        = useState("");

  /* Sessions */
  const { data: sessionsData } = useGetAllSessionsQuery();
  const sessions = sessionsData?.data || [];

  /* Versions for this subLevel filtered by session */
  const { data: versionsData, refetch } = useGetSyllabusVersionsBySubLevelQuery(
    { subLevelId, sessionId: selectedSessionId },
    { skip: !subLevelId, refetchOnMountOrArgChange: true }
  );
  const allVersions = versionsData?.data || [];

  /* Group by subjectName */
  const grouped = useMemo(() => {
    const g = {};
    allVersions.forEach((v) => {
      if (!g[v.subjectName]) g[v.subjectName] = [];
      g[v.subjectName].push(v);
    });
    return g;
  }, [allVersions]);

  const subjectNames = Object.keys(grouped).sort();

  /* Auto-select first subject */
  const currentSubject = activeSubject && grouped[activeSubject] ? activeSubject : subjectNames[0] || "";

  /* Versions for current subject */
  const subjectVersions = grouped[currentSubject] || [];

  /* Active version for current subject */
  const activeVersionId = selectedVersionId[currentSubject]
    || subjectVersions.find((v) => v.status === "active")?._id
    || subjectVersions[0]?._id
    || "";

  const activeVersionDoc = subjectVersions.find((v) => v._id === activeVersionId);

  const [deleteSyllabusVersion]   = useDeleteSyllabusVersionMutation();
  const [approveSyllabusVersion]  = useApproveSyllabusVersionMutation();
  const [activateSyllabusVersion] = useActivateSyllabusVersionMutation();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this version?")) return;
    try { await deleteSyllabusVersion(id).unwrap(); toast.success("Deleted"); refetch(); }
    catch (err) { toast.error(err?.data?.message || "Delete failed"); }
  };
  const handleApprove = async (id) => {
    try { await approveSyllabusVersion(id).unwrap(); toast.success("Approved!"); refetch(); }
    catch (err) { toast.error(err?.data?.message || "Approve failed"); }
  };
  const handleActivate = async (id) => {
    try { await activateSyllabusVersion(id).unwrap(); toast.success("Activated!"); refetch(); }
    catch (err) { toast.error(err?.data?.message || "Activate failed"); }
  };

  /* ── Empty state ── */
  if (allVersions.length === 0 && !selectedSessionId) {
    return (
      <EmptyUploadState level={level} subLevel={subLevel} onSaved={refetch} />
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Top filter bar: Session + Search ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
        <input
          type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search topic or subtopic..."
          className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <select
          value={selectedSessionId}
          onChange={(e) => { setSelectedSessionId(e.target.value); setActiveSubject(""); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white min-w-[160px]"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* ── No data after session filter ── */}
      {allVersions.length === 0 && selectedSessionId && (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center text-gray-400 text-sm">
          No syllabus found for this session
        </div>
      )}

      {subjectNames.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* ── Subject tabs ── */}
          <div className="flex gap-0 overflow-x-auto border-b border-gray-100">
            {subjectNames.map((name) => {
              const versions = grouped[name];
              const hasActive = versions.some((v) => v.status === "active");
              return (
                <button
                  key={name}
                  onClick={() => { setActiveSubject(name); setSearchTerm(""); }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                    currentSubject === name
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <MdBook size={15} className={currentSubject === name ? "text-orange-500" : "text-gray-400"} />
                  {name}
                  {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* ── Version selector + status bar ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Version:</span>
            <select
              value={activeVersionId}
              onChange={(e) => setSelectedVersionId((p) => ({ ...p, [currentSubject]: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400 bg-white"
            >
              {subjectVersions.map((v) => (
                <option key={v._id} value={v._id}>
                  {currentSubject} {v.version} — {v.status}{v.status === "active" ? " ✓" : ""}
                </option>
              ))}
            </select>

            {activeVersionDoc && (
              <>
                <StatusBadge status={activeVersionDoc.status} />
                <span className="text-xs text-gray-400">Session: {activeVersionDoc.sessionId?.name || "—"}</span>
                <div className="flex items-center gap-2 ml-auto">
                  {activeVersionDoc.status === "draft" && (
                    <button onClick={() => handleApprove(activeVersionDoc._id)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold transition">Approve</button>
                  )}
                  {activeVersionDoc.status === "approved" && (
                    <button onClick={() => handleActivate(activeVersionDoc._id)} className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-semibold transition">Activate</button>
                  )}
                  {activeVersionDoc.status !== "active" && (
                    <button onClick={() => handleDelete(activeVersionDoc._id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                      <MdDelete size={15} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Inner Tabs: Syllabus / Tasks ── */}
          <InnerTabs versionId={activeVersionId} searchTerm={searchTerm} />
        </div>
      )}
    </div>
  );
};

export default SyllabusTab;
