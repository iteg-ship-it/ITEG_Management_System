# Quick Reference: Optimized Schema Usage

## 🎯 When to Use What

### Use TaskMaster When:
- ✅ Creating new task definitions
- ✅ Updating task templates
- ✅ Managing assignment rules
- ✅ Viewing current task configuration

### Use StudentTaskProgress When:
- ✅ Tracking student progress
- ✅ Generating report cards
- ✅ Dashboard queries
- ✅ Checking promotion eligibility
- ✅ Historical student records

---

## 📝 Common Operations

### 1. Create Task and Assign to Students
```javascript
// Step 1: Create TaskMaster
const taskMaster = await TaskMaster.create({
  syllabusVersionId,
  subjectName: "Data Structures",
  topicName: "Arrays",
  title: "Array Implementation",
  maxMarks: 100,
  cutoff: 60,
  mandatory: true,
  assignmentType: "all"
});

// Step 2: Auto-assign to students (creates snapshot)
await assignTaskToStudents(taskMaster._id);
```

### 2. Get Student Dashboard (Fast Query)
```javascript
// No join needed - uses snapshot
const tasks = await StudentTaskProgress.find(
  { studentId, syllabusVersionId },
  { snapshot: 1, status: 1, progressPercentage: 1, marksObtained: 1 }
).lean();

// Group by subject - direct access
const bySubject = tasks.reduce((acc, task) => {
  const subject = task.snapshot.subjectName;
  if (!acc[subject]) acc[subject] = [];
  acc[subject].push(task);
  return acc;
}, {});
```

### 3. Generate Report Card (Fast Query)
```javascript
// Single query, no join
const reportCard = await calculateReportCard(studentId, syllabusVersionId);
```

### 4. Check Promotion Eligibility (Indexed Query)
```javascript
// Uses compound index for speed
const eligibility = await checkPromotionEligibility(studentId, syllabusVersionId);
```

### 5. Update TaskMaster (Doesn't Affect Existing Assignments)
```javascript
// Update template
await TaskMaster.findByIdAndUpdate(taskMasterId, {
  maxMarks: 120,  // New assignments get 120
  cutoff: 72      // New assignments get 72
});

// Existing StudentTaskProgress records unchanged ✅
```

---

## ⚡ Performance Tips

### DO ✅
```javascript
// Use lean() for read-only queries
.lean()

// Use projection to limit fields
.find({}, { snapshot: 1, status: 1 })

// Use indexes in queries
.find({ studentId, syllabusVersionId, status: "pending" })

// Batch operations
.insertMany(records, { ordered: false })
```

### DON'T ❌
```javascript
// Don't populate TaskMaster for dashboard
.populate('taskMasterId')  // Slow!

// Don't fetch all fields
.find({})  // Use projection

// Don't use non-indexed fields in queries
.find({ "snapshot.description": "..." })  // Not indexed

// Don't insert one by one
for (const record of records) {
  await create(record);  // Slow!
}
```

---

## 🔍 Query Patterns

### Dashboard Query
```javascript
StudentTaskProgress.find(
  { studentId, syllabusVersionId },
  { snapshot: 1, status: 1, progressPercentage: 1 }
).lean();
```

### Subject-wise Tasks
```javascript
StudentTaskProgress.find(
  { studentId, "snapshot.subjectName": "DSA" },
  { snapshot: 1, marksObtained: 1, isPassed: 1 }
).lean();
```

### Pending Mandatory Tasks
```javascript
StudentTaskProgress.find(
  {
    studentId,
    syllabusVersionId,
    "snapshot.mandatory": true,
    isPassed: false
  },
  { snapshot: 1, status: 1 }
).lean();
```

### Submitted Tasks (Teacher View)
```javascript
StudentTaskProgress.find(
  { status: "submitted" },
  { studentId: 1, snapshot: 1, submittedAt: 1 }
).sort({ submittedAt: -1 })
.lean();
```

---

## 🎯 Key Principles

1. **Snapshot at Assignment Time**: Copy critical fields when creating StudentTaskProgress
2. **Never Join for Dashboard**: Use snapshot fields directly
3. **Use Indexes**: All frequent queries should use indexed fields
4. **Lean Queries**: Always use .lean() for read-only operations
5. **Projection**: Only fetch fields you need
6. **Batch Operations**: Use insertMany/updateMany for bulk operations

---

## 📊 Field Access Guide

| Need | Source | Query |
|------|--------|-------|
| Task title | `snapshot.taskTitle` | No join |
| Subject name | `snapshot.subjectName` | No join |
| Max marks | `snapshot.maxMarks` | No join |
| Cutoff | `snapshot.cutoff` | No join |
| Student marks | `marksObtained` | No join |
| Pass status | `isPassed` | No join |
| Task description | `TaskMaster.description` | Join needed |
| Current priority | `TaskMaster.priority` | Join needed |

**Rule**: If you need it frequently, it should be in snapshot!

---

## 🚀 Production Checklist

- ✅ All indexes created
- ✅ Using lean() for read queries
- ✅ Using projection to limit fields
- ✅ Batch operations for bulk inserts
- ✅ Error handling for duplicate keys
- ✅ Snapshot logic in assignment
- ✅ Lock mechanism before promotion
- ✅ Audit trail (assignedAt, lockedAt)

---

## 📈 Monitoring Queries

### Slow Query Detection
```javascript
// Enable MongoDB profiling
db.setProfilingLevel(1, { slowms: 100 });

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } });
```

### Index Usage
```javascript
// Explain query
StudentTaskProgress.find({ studentId }).explain("executionStats");

// Check if index is used
// Look for: "stage": "IXSCAN" (good)
// Avoid: "stage": "COLLSCAN" (bad)
```

---

## 🔧 Troubleshooting

### Query is Slow
1. Check if using indexed fields
2. Use .explain() to verify index usage
3. Add projection to limit fields
4. Use .lean() for read-only queries

### High Storage Usage
1. Check if archiving old records
2. Verify no duplicate records
3. Consider TTL indexes for temporary data

### Inconsistent Data
1. Verify snapshot logic in assignment
2. Check if TaskMaster updates affecting old records
3. Ensure lock mechanism working

---

This is your go-to reference for working with the optimized schema! 🚀
