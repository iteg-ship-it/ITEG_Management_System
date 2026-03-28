# Syllabus Management System - Schema Documentation

## 📋 Schema Structure

```
Subject (Java)
├── topicIds: [Topic IDs]
├── subTopicIds: [SubTopic IDs]
│
Topic (Task)
├── subjectId: Subject ID reference
│
SubTopic (Task under Topic)
├── subjectId: Subject ID reference
├── topicId: Topic ID reference
│
TaskMaster
├── subjectId: Subject ID reference
├── topicId: Topic ID reference
└── subTopicId: SubTopic ID reference
```

## 🏗️ Collections

### 1. Subject Collection
```javascript
{
  _id: ObjectId,
  name: "Java",
  code: "JAVA101",
  description: "Java Programming",
  topicIds: [ObjectId, ObjectId],      // References to Topics
  subTopicIds: [ObjectId, ObjectId],   // References to SubTopics
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Topic Collection
```javascript
{
  _id: ObjectId,
  name: "Task",
  subjectId: ObjectId,  // Reference to Subject
  order: 1,
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. SubTopic Collection
```javascript
{
  _id: ObjectId,
  name: "Sub Task",
  topicId: ObjectId,     // Reference to Topic
  subjectId: ObjectId,   // Reference to Subject
  order: 1,
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. TaskMaster Collection
```javascript
{
  _id: ObjectId,
  title: "Complete Java Assignment",
  description: "Implement OOP concepts",
  subjectId: ObjectId,   // Reference to Subject
  topicId: ObjectId,     // Reference to Topic
  subTopicId: ObjectId,  // Reference to SubTopic
  difficultyLevel: "Medium",
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

## 📝 Usage Examples

### Create Subject
```javascript
const { Subject } = require('./models/syllabus');

const subject = await Subject.create({
  name: 'Java',
  code: 'JAVA101',
  description: 'Java Programming Language'
});
```

### Create Topic and Link to Subject
```javascript
const { queries } = require('./models/syllabus');

const topic = await queries.createTopicAndLinkToSubject(subjectId, {
  name: 'Task',
  order: 1
});
// This automatically adds topic._id to subject.topicIds
```

### Create SubTopic and Link to Subject
```javascript
const subTopic = await queries.createSubTopicAndLinkToSubject(
  subjectId,
  topicId,
  {
    name: 'Sub Task',
    order: 1
  }
);
// This automatically adds subTopic._id to subject.subTopicIds
```

### Create Task
```javascript
const { TaskMaster } = require('./models/syllabus');

const task = await TaskMaster.create({
  title: 'Complete Java Assignment',
  description: 'Implement OOP concepts',
  subjectId: subjectId,
  topicId: topicId,
  subTopicId: subTopicId,
  difficultyLevel: 'Medium'
});
```

### Get Full Hierarchy
```javascript
const fullSyllabus = await queries.getFullSyllabusHierarchy(subjectId);
// Returns subject with populated topicIds, subTopicIds, and all tasks
```

### Get Tasks by Topic
```javascript
const tasks = await queries.getTasksByTopic(topicId);
// Returns all tasks under a specific topic
```

### Get Tasks by SubTopic
```javascript
const tasks = await queries.getTasksBySubTopic(subTopicId);
// Returns all tasks under a specific subtopic
```

## 🔍 Key Features

✅ **Subject stores Topic & SubTopic IDs** - Direct references in arrays
✅ **TaskMaster has all 3 references** - subjectId, topicId, subTopicId
✅ **Proper Indexing** - Optimized for fast queries
✅ **Validation** - Required fields and constraints
✅ **Timestamps** - Auto createdAt/updatedAt
✅ **Helper Functions** - Auto-linking when creating entities

## 📊 Indexes

### Subject
- `code` (unique)
- `isActive, createdAt`

### Topic
- `subjectId, order`
- `subjectId, isActive`

### SubTopic
- `topicId, order`
- `subjectId, topicId`
- `topicId, isActive`

### TaskMaster
- `subjectId, topicId, subTopicId`
- `topicId, isActive`
- `subTopicId, isActive`
- `difficultyLevel, isActive`
