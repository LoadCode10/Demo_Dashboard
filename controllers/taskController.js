const Task = require('../model/Task');


const getAllTasks = async (req, res)=>{
  try {
    const tasks = await Task.find();
    if(tasks.length === 0) return res.status(204).json({
      "message": "No Task Found!"
    });
    const formattedTasks = tasks.map(task=>({
      id: task._id,
      owner: task.owner,
      title: task.title,
      taskStatus: task.taskStatus,
      taskPriority: task.taskPriority,
      dueDate: task.dueDate
    }));

    res.status(201).json(formattedTasks);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:"Server Error"
    });
  }
};


const creatNewTask = async (req,res)=>{
  const {
    owner,
    title,
    taskStatus,
    taskPriority,
    dueDate,
    member
  } = req.body;

  if(!owner || !title || !taskStatus || !taskPriority || !dueDate ||!member){
    return res.status(400).json({
      message: 'Owner, title, status, priority and due date are required'
    });
  };

  try {
    const newTask = await Task.create({
      owner,
      title,
      taskStatus,
      taskPriority,
      dueDate,
      member
    });

    return res.status(201).json({
      id: newTask._id,
      owner: newTask.owner,
      title: newTask.title,
      taskStatus: newTask.taskStatus,
      taskPriority: newTask.taskPriority,
      dueDate: newTask.dueDate,

    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

const getTaskById =async (req,res)=>{
  const { id } = req.params;

  const selectedTask = await Task.findById(id)

  if(!selectedTask){
    return res.status(400).json({
      message: `the task with id: ${id} doesn't exist`
    })
  };

  return res.status(200).json({
    id: selectedTask._id,
    owner: selectedTask.owner,
    title: selectedTask.title,
    taskStatus: selectedTask.taskStatus,
    taskPriority: selectedTask.taskPriority,
    dueDate: selectedTask.dueDate,
    member: selectedTask.member
  })

};

const updateTask = async (req,res)=>{
  const {id} = req.params;
  const {owner,title,taskStatus,taskPriority,dueDate,member} = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,{
        owner,
        title,
        taskStatus,
        taskPriority,
        dueDate,
        member
      },
      {
        new: true,
        runValidators: true
      }
    );

    if(!updatedTask){
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(updatedTask);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
}

const deleteTask = async (req,res)=>{
  const { id } = req.params;

  const deletedTask = await Task.findByIdAndDelete(id);

  return res.status(201).json({
    id: deletedTask._id,
    owner: deletedTask.owner,
    title: deletedTask.title,
    taskStatus: deletedTask.taskStatus,
    taskPriority: deletedTask.taskPriority,
    dueDate: deletedTask.dueDate
  })
}

const getTaskStatsCount = async(req,res)=>{
  try {
    const stats = await Task.aggregate([
      {
        $group:{
          _id:"$taskStatus",
          count: {$sum: 1}
        }
      }
    ]);

    const statsObj = {
      Done : 0,
      InProgress: 0,
      InQueue: 0,
      OnReview: 0
    };

    stats.forEach(item =>{
      const key = item._id.replace(/\s+/g, '');
      statsObj[key] = item.count;
    })

    return res.status(200).json(statsObj);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

const searchTasksQuery = async (req, res) => {
  try {
    const { search } = req.query;

    const allTasks = await Task.find().populate("member", "fullName");

    if (!search) {
      return res.status(200).json(allTasks);
    }

    const keyword = search.toLowerCase();

    let tasks = await Task.find().populate("member", "fullName");

    const filteredTasks = tasks.filter((t) => {
      return (
        t.title?.toLowerCase().includes(keyword) ||
        t.taskStatus?.toLowerCase().includes(keyword) ||
        t.taskPriority?.toLowerCase().includes(keyword) ||
        t.member?.fullName?.toLowerCase().includes(keyword)
      );
    });

    return res.status(200).json(filteredTasks);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// const searchTasksQuery = async (req, res) => {
//   try {
//     const { search } = req.query;
//     const keyword = search ? search.toLowerCase() : "";

//     const tasks = await Task.find().populate("member", "fullName");

//     // DIAGNOSTIC LOGS - Check your terminal!
//     if (tasks.length > 0) {
//       console.log("DEBUG: First task title:", tasks[0].title);
//       console.log("DEBUG: First task member object:", tasks[0].member);
//     } else {
//       console.log("DEBUG: No tasks found in database at all.");
//     }

//     const filteredTasks = tasks.filter((t) => {
//       const titleMatch = t.title?.toLowerCase().includes(keyword);
//       const memberMatch = t.member?.fullName?.toLowerCase().includes(keyword);
      
//       return titleMatch || memberMatch;
//     });

//     console.log(`DEBUG: Search for "${keyword}" returned ${filteredTasks.length} results`);

//     return res.status(200).json(filteredTasks);
//   } catch (error) {
//     console.error("Search Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

const getTasks = async (req,res)=>{
  if(req.query.search){
    return searchTasksQuery(req,res);
  }

  return getAllTasks(req,res);
}

const getMemberTasks = async (req,res)=>{
  const {id} = req.params;
  
  try {
    const memberTasks = await Task.find({member: id}).sort({createdAt: -1});

    return res.status(200).json(memberTasks);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
  
}


module.exports = {
  getAllTasks,
  creatNewTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStatsCount,
  searchTasksQuery,
  getTasks,
  getMemberTasks
}




