import { format } from "https://cdn.jsdelivr.net/npm/date-fns@3.6.0/+esm";
let initialized = false;

export function manageAllTasks(elements){

  if(initialized) return;
  initialized = true;

  const {
    modal,
    closeBtn,
    taskForm,
    ownerInput,
    taskTitleInput,
    taskStatusInput,
    taskPriorityInput,
    dueDateInput,
    tasksBodyTable,
    createTaskBtn,
    searchInput,
    modalInfo,
    closeBtnInfo,
    taskHeaderDate
  } = elements;

  const date = new Date();
  const formattedDate = format(date,"MMMM dd, yyyy");
  taskHeaderDate.innerHTML = `${formattedDate}`;

  async function renderTasksStats(){
    try {
      const response = await fetch('http://localhost:8080/api/tasks/stats');

      if(!response.ok){
        throw new Error(`we can't fetch tasks Stats`)
      }

      const stats = await response.json();

      console.log(stats);

      elements.doneOutput.innerHTML = stats.Done;
      elements.inProgressOutput.innerHTML = stats.InProgress;
      elements.inQueueOutput.innerHTML = stats.InQueue;
      elements.onReviewOutput.innerHTML = stats.OnReview;


    } catch (error) {
      console.log(error);
    }
  };

  // renderTasksStats()

  //Here i will make my opdated modal form to add my reel members from my data base

  async function fetchTeamMembers(){
    try {
      const response = await fetch('http://localhost:8080/api/members');

      if(!response.ok){
        throw new Error(`we can't fetch members`);
      }

      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  async function openTaskModal(){
    const members = await fetchTeamMembers();
    console.log(members);
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&#10060;</span>
        <h2>Create New Task</h2>
        
        <form id="taskForm">
          <label for="taskOwner">Task Owner:</label>
          <select id="taskOwner" required>
            <option value="">Select a member</option>
            ${members.map(m => `
              <option value="${m.fullName}" data-member-id="${m._id}">
                ${m.fullName}
              </option>
            `).join("")}
          </select>

          <label for="taskTitle">Task Title:</label>
          <input type="text" id="taskTitle" name="taskTitle" required>

          <label for="taskStatus">Status:</label>
          <select id="taskStatus" name="taskStatus" required>
            <option value="In Queue">In Queue</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="On Review">On Review</option>
          </select>

          <label for="taskPriority">Priority:</label>
          <select id="taskPriority" name="taskPriority" required>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label for="dueDate">Due Date:</label>
          <input type="date" id="dueDate" name="dueDate" required>

          <button type="submit" id="saveTaskBtn" class="saveTaskBtn">Save Task</button>
          <button type="button" id="updateTaskBtn" class="updateTaskBtn">Update Task</button>
        </form>
      </div>
    `;
    document.querySelector('.saveTaskBtn').style.display = 'block';
    document.querySelector('.updateTaskBtn').style.display = 'none';
    const closeBtn =  document.querySelector('.close-btn');
    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', submitTask);
    // Close modal (X button)
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      clearInputsFields();
      modal.innerHTML = '';
    });
    //UPDATE BUTTON HANDLER
    document.getElementById('updateTaskBtn').onclick = async () => {
      await updateSelectedTask();
      clearInputsFields();
      modal.style.display = 'none';
    };
  }

  createTaskBtn.addEventListener('click',async () => {
    await openTaskModal();
    // const members = await fetchTeamMembers();
    // console.log(members);
    // modal.style.display = 'block';
    // modal.innerHTML = `
    //   <div class="modal-content">
    //     <span class="close-btn">&#10060;</span>
    //     <h2>Create New Task</h2>
        
    //     <form id="taskForm">
    //       <label for="taskOwner">Task Owner:</label>
    //       <select id="taskOwner" required>
    //         <option value="">Select a member</option>
    //         ${members.map(m => `
    //           <option value="${m.fullName}" data-member-id="${m._id}">
    //             ${m.fullName}
    //           </option>
    //         `).join("")}
    //       </select>

    //       <label for="taskTitle">Task Title:</label>
    //       <input type="text" id="taskTitle" name="taskTitle" required>

    //       <label for="taskStatus">Status:</label>
    //       <select id="taskStatus" name="taskStatus" required>
    //         <option value="In Queue">In Queue</option>
    //         <option value="In Progress">In Progress</option>
    //         <option value="Done">Done</option>
    //         <option value="On Review">On Review</option>
    //       </select>

    //       <label for="taskPriority">Priority:</label>
    //       <select id="taskPriority" name="taskPriority" required>
    //         <option value="Low">Low</option>
    //         <option value="Medium">Medium</option>
    //         <option value="High">High</option>
    //       </select>

    //       <label for="dueDate">Due Date:</label>
    //       <input type="date" id="dueDate" name="dueDate" required>

    //       <button type="submit" id="saveTaskBtn" class="saveTaskBtn">Save Task</button>
    //       <button type="button" id="updateTaskBtn" class="updateTaskBtn">Update Task</button>
    //     </form>
    //   </div>
    // `;
    // document.querySelector('.saveTaskBtn').style.display = 'block';
    // document.querySelector('.updateTaskBtn').style.display = 'none';
    // const closeBtn =  document.querySelector('.close-btn');
    // const taskForm = document.getElementById('taskForm');
    // // Close modal (X button)
    // closeBtn.addEventListener('click', () => {
    //   modal.style.display = 'none';
    //   clearInputsFields();
    //   modal.innerHTML = '';
    // });

    // taskForm.addEventListener('submit',submitTask);
  });
  // Close modal when clicking outside modal-content
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      modal.innerHTML = '';
      clearInputsFields();
    }
  });
  // Close modal with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
      modal.innerHTML = '';
      clearInputsFields();
    }
  });

  async function submitTask (e){
    e.preventDefault();

    const taskTitleInput = document.getElementById('taskTitle');
    const taskStatusInput = document.getElementById('taskStatus');
    const taskPriorityInput = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('dueDate');

    const ownerSelect = document.getElementById('taskOwner');
    const selectedOption = ownerSelect.options[ownerSelect.selectedIndex];

    const member = selectedOption.dataset.memberId;

    if(!member) {
      alert('Please select a member!');
      return;
    }
    
    const owner = selectedOption.value.trim();
    const title = taskTitleInput.value.trim();
    const taskStatus = taskStatusInput.value.trim();
    const taskPriority = taskPriorityInput.value.trim();
    const dueDate = dueDateInput.value.trim();

    console.log(selectedOption);

    try{

      await addTaskToDB(owner,title,taskStatus,taskPriority,dueDate,member);

      renderTasks();

      clearInputsFields();

      modal.style.display = 'none';
    } catch (error) {
      console.log(error);
    }

  }

  // taskForm.addEventListener('submit',async (e)=>{
  //   e.preventDefault();
    
  //   const owner = ownerInput.value.trim();
  //   const title = taskTitleInput.value.trim();
  //   const taskStatus = taskStatusInput.value.trim();
  //   const taskPriority = taskPriorityInput.value.trim();
  //   const dueDate = dueDateInput.value.trim();

  //   try{

  //     addTaskToDB(owner,title,taskStatus,taskPriority,dueDate);

  //     renderTasks();

  //     clearInputsFields();

  //     modal.style.display = 'none';
  //   } catch (error) {
  //     console.log(error);
  //   }

  // });

  async function renderTasks(){
    try {

      const response = await fetch('http://localhost:8080/api/tasks');

      if(!response.ok){
        throw new Error(`we can't fetch your tasks`);
      }

      // const allTasks = await response.json();
      const text = await response.text();
      const allTasks = text ? JSON.parse(text) : [];

      tasksBodyTable.innerHTML = '';

      console.log(allTasks);

      allTasks.forEach(task=>{
        let badgeClass = ''
        const tr = document.createElement('tr');
        if(task.taskStatus === "In Progress"){
          badgeClass = 'progress';
        }else{
          badgeClass = task.taskStatus.toLowerCase();
        }
        let priorityClass = task.taskPriority.toLowerCase();
        
        tr.innerHTML = `
          <td>${task.owner}</td>
          <td>${task.title}</td>
          <td>
            <span class="badge ${badgeClass}">${task.taskStatus}</span>
          </td>
          <td>
            <span class="priority ${priorityClass}">${task.taskPriority}</span>
          </td>
          <td class="more-action-td">
            <span class="edit-btn">
              <i class="fa-regular fa-pen-to-square edit-icon" data-task-id=${task.id}></i>
            </span>
            <span class="delete-btn">
              <i class="fa-solid fa-trash delete-icon" data-task-id=${task.id}></i>
            </span>
            <span class="reminder-btn">
              <i class="fa-solid fa-circle-info info-icon" data-task-id=${task.id}></i>
            </span>
          </td>
        `;

        tasksBodyTable.appendChild(tr);
      });

      renderTasksStats();
      
    } catch (error) {
      console.log(error);
    }
  }

  async function addTaskToDB(owner,title,taskStatus,taskPriority,dueDate,member){
    
    // console.log({ owner, title, taskStatus, taskPriority, dueDate });
    const response =await fetch('http://localhost:8080/api/tasks',{
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        owner,
        title,
        taskStatus,
        taskPriority,
        dueDate,
        member
      })
    });

    console.log({
      owner,
      title,
      taskStatus,
      taskPriority,
      dueDate,
      member
    });

    if(!response.ok){
      throw new Error('your task not added to database');
    }

    const addedTask = await response.json();

    console.log(addedTask);
    
  }

  function clearInputsFields(){
    ownerInput.value  = '';
    taskTitleInput.value = '';
    taskStatusInput.value = '';
    taskPriorityInput.value = '';
    dueDateInput.value = '';
  }

  let selectedTaskId = null;
  function taskByID(){
    tasksBodyTable.addEventListener('click',async (e)=>{
      const target = e.target;

      selectedTaskId = e.target.dataset.taskId;

      console.log(selectedTaskId);

      if (target.classList.contains('edit-icon')) {
        selectedTaskId = target.dataset.taskId;
        await loadTaskToModal(selectedTaskId);
      }

      // DELETE
      if (target.classList.contains('delete-icon')) {
        const taskId = target.dataset.taskId;
        await deleteTask(taskId);
      }

      if (target.classList.contains('info-icon')){
        const taskId = target.dataset.taskId;
        await showModalInfoTask(taskId);
      }
    })
  };

  async function updateSelectedTask(){
    if(!selectedTaskId) return;
    try {
      const taskTitleInput = document.getElementById('taskTitle');
      const taskStatusInput = document.getElementById('taskStatus');
      const taskPriorityInput = document.getElementById('taskPriority');
      const dueDateInput = document.getElementById('dueDate');
      const ownerSelect = document.getElementById('taskOwner');
      const selectedOption = ownerSelect.options[ownerSelect.selectedIndex];
      const member = selectedOption.dataset.memberId;

      const owner = selectedOption.value.trim();
      const title = taskTitleInput.value.trim();
      const taskStatus = taskStatusInput.value.trim();
      const taskPriority = taskPriorityInput.value.trim();
      const dueDate = dueDateInput.value.trim();

      const response = await fetch(`http://localhost:8080/api/tasks/${selectedTaskId}`,{
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          owner,
          title,
          taskStatus,
          taskPriority,
          dueDate,
          member
        })
      });

      if(!response.ok){
        throw new Error(`your task doesn't updated`);
      }

      const updatedTask = await response.json();
      console.log('task updated successffully');
      console.log(updatedTask);

      renderTasks();
      
    } catch (error) {
      console.log(error);
    }
  };

  async function loadTaskToModal(id) {
    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${id}`);
      if (!response.ok) throw new Error('Cannot fetch task');
      const task = await response.json();

      await openTaskModal();
      
      // modal.style.display = 'block';
      // ownerInput.value = task.owner;
      // taskTitleInput.value = task.title;
      // taskStatusInput.value = task.taskStatus;
      // taskPriorityInput.value = task.taskPriority;
      // document.getElementById('taskOwner').value = task.owner;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskStatus').value = task.taskStatus;
      document.getElementById('taskPriority').value = task.taskPriority;
      document.getElementById('dueDate').value = new Date(task.dueDate).toISOString().split('T')[0];

      const ownerSelect = document.getElementById('taskOwner');

      Array.from(ownerSelect.options).forEach(option => {
        if (option.dataset.memberId === task.member) {
          option.selected = true;
        }
      })

      document.querySelector('.updateTaskBtn').style.display = 'block';
      document.querySelector('.saveTaskBtn').style.display = 'none';

      console.log(task);
      

    } catch (err) {
      console.log(err);
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Task not deleted');
      renderTasks(); // re-render table
    } catch (err) {
      console.log(err);
    }
  }

  async function getTaskInfo(id){
    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${id}`);

      if(!response.ok){
        throw new Error(`could not fetch ${id} task data`);
      }

      const taskData = await response.json();

      return taskData;
    } catch (error) {
      console.log(error);
    }
  }

  let debounceTimer;
  async function searchTask(keyword){
    try {
      const url = keyword 
      ? `http://localhost:8080/api/tasks?search=${encodeURIComponent(keyword)}`
      : `http://localhost:8080/api/tasks`;

      const response = await fetch(url);
      if(!response.ok){
        throw new Error('response was not ok');
      }
      const tasks = await response.json();
      console.log(tasks);
      renderSearchedTasks(tasks);

    } catch (error) {
      console.log(error);
    }
  };

  searchInput.addEventListener('input',async (e)=>{
    // await searchTask(e.target.value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async()=>{
      await searchTask(e.target.value);
    },300);
  });

  async function renderSearchedTasks(tasks){
    tasksBodyTable.innerHTML = '';
    tasks.forEach(task=>{
        let badgeClass = ''
        const tr = document.createElement('tr');
        if(task.taskStatus === "In Progress"){
          badgeClass = 'progress';
        }else{
          badgeClass = task.taskStatus.toLowerCase();
        }
        let priorityClass = task.taskPriority.toLowerCase();
        
        tr.innerHTML = `
          <td>${task.owner}</td>
          <td>${task.title}</td>
          <td>
            <span class="badge ${badgeClass}">${task.taskStatus}</span>
          </td>
          <td>
            <span class="priority ${priorityClass}">${task.taskPriority}</span>
          </td>
          <td class="more-action-td">
            <span class="edit-btn">
              <i class="fa-regular fa-pen-to-square edit-icon" data-task-id=${task.id}></i>
            </span>
            <span class="delete-btn">
              <i class="fa-solid fa-trash delete-icon" data-task-id=${task.id}></i>
            </span>
            <span class="reminder-btn">
              <i class="fa-solid fa-circle-info info-icon" data-task-id=${task.id}></i>
            </span>
          </td>
        `;

        tasksBodyTable.appendChild(tr);
      });
  }

  async function showModalInfoTask(id){
    
    const task = await getTaskInfo(id);
    if (!task) return;

    modalInfo.style.display = "flex";
    modalInfo.innerHTML = `
      <div class="modal-content">
        <span class="close-btn-info">&times;</span>

        <h3>Task Details</h3>

        <ul class="task-info">
          <li><strong>Title:</strong> <span id="m-title"></span></li>
          <li><strong>Owner:</strong> <span id="m-owner"></span></li>
          <li><strong>Status:</strong> <span id="m-status"></span></li>
          <li><strong>Priority:</strong> <span id="m-priority"></span></li>
          <li><strong>Due Date:</strong> <span id="m-date"></span></li>
        </ul>
      </div>
    `;

    document.getElementById("m-title").textContent = task.title;
    document.getElementById("m-owner").textContent = task.owner;
    document.getElementById("m-status").textContent = task.taskStatus;
    document.getElementById("m-priority").textContent = task.taskPriority;
    document.getElementById("m-date").textContent =
      new Date(task.dueDate).toLocaleDateString();

    document.querySelector(".close-btn-info").onclick = () => modalInfo.style.display = "none";
  
  }

  window.onclick = (e) => {
    if (e.target === modalInfo) {
      modalInfo.style.display = "none";
    }
  };


  // document.querySelector('.updateTaskBtn').addEventListener('click',()=>{
  //   updateSelectedTask();
  //   clearInputsFields();
  //   modal.style.display = 'none';
  // });

  taskByID();

  renderTasks();

}

