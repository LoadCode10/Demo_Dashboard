import { manageAllTasks } from './allTasks.js';
import { manageAllMembers } from './allMembers.js';

const socket = io();

const navLinks = document.querySelectorAll('.nav-link');
const sidebar = document.querySelector('.sidebar');

const elements = {
  modal: document.getElementById('taskModal'),
  closeBtn: document.querySelector('.close-btn'),
  taskForm: document.getElementById('taskForm'),
  ownerInput: document.getElementById('taskOwner'),
  taskTitleInput: document.getElementById('taskTitle'),
  taskStatusInput: document.getElementById('taskStatus'),
  taskPriorityInput: document.getElementById('taskPriority'),
  dueDateInput: document.getElementById('dueDate'),
  tasksBodyTable: document.querySelector('.tasks-body-table'),
  createTaskBtn: document.getElementById('createTaskBtn'),
  doneOutput : document.querySelector('.done-stats'),
  inProgressOutput : document.querySelector('.inprogress-stats'),
  inQueueOutput : document.querySelector('.inqueue-stats'),
  onReviewOutput : document.querySelector('.onreview-stats'),
  searchInput : document.getElementById('search-tasks'),
  modalInfo : document.getElementById("taskModalInfo"),
  taskHeaderDate : document.querySelector(".task-header-date")
};

const membersElms = {
  searchMembersInput: document.getElementById('search-members'),

  createMemberBtn: document.getElementById('createMemberBtn'),
  memberModal: document.getElementById('memberModal'),
  closeMemberBtn: document.getElementById('closeModal'),
  saveMemberBtn: document.getElementById('memberForm'),
  updateMemberBtn: document.getElementById('updateMemberBtn'),

  fullnameInput: document.getElementById('fullName'),
  cinInput: document.getElementById('cin'),
  profileInput: document.getElementById('profil'),
  departementInput: document.getElementById('departement'),
  hiredateInput: document.getElementById('hiredDate'),
  emailInput: document.getElementById('email'),
  phonenumInput: document.getElementById('phoneNum'),

  teamGrid: document.querySelector('.team-grid'),

  saveBtn: document.getElementById('save-btn'),
  closeEmailBtn : document.querySelector('.close-btn-email'),
  modalEmail : document.querySelector('.modal-overlay-email'),
  teamHeaderDate : document.querySelector('.team-header-date'),
  memberTaskModal : document.querySelector('.member-tasks-modal'),
  closeMemberModal : document.getElementById("closeMemberModal"),
  memberNameEl : document.getElementById("memberName"),
  memberTaskCount : document.getElementById("memberTaskCount"),
  memberTaskList : document.getElementById("memberTaskList"),
};

manageAllTasks(elements)
manageAllMembers(membersElms)

const menuToggles = document.querySelectorAll('.menu-toggle');

const pages= document.querySelectorAll('.page');

// ===== ACTIVE NAV LINK =====
navLinks.forEach(link => {
  link.addEventListener('click', () => {

    // Remove active from all
    navLinks.forEach(item => item.classList.remove('active'));

    // Add active to clicked
    link.classList.add('active');

    // Get selected page (future routing)
    const page = link.dataset.page;
    console.log('Selected page:', page);

    pages.forEach(p => p.classList.remove('active'));

    document.getElementById(page).classList.add('active');

    if(page === '#tasks'){
      return manageAllTasks(elements);
    }
    if(page === '#team'){
      return manageAllMembers(membersElms);
    }

    // Close sidebar on mobile
    sidebar.classList.remove('open');
  });
});

// ===== TOGGLE SIDEBAR (MOBILE) =====
menuToggles.forEach(btn=>{
  btn.addEventListener('click',(e)=>{
    e.stopPropagation();
    sidebar.classList.toggle('open');
  })
})

// ===== CLOSE SIDEBAR WHEN CLICK OUTSIDE (MOBILE UX) =====
document.addEventListener('click', (e) => {
  if (
    (window.innerWidth <= 1024) &&
    !sidebar.contains(e.target) &&
    ![...menuToggles].some(btn => btn.contains(e.target))
  ) {
    sidebar.classList.remove('open');
  }
});

//the Real-Time Messages Part
const messagesContainer = document.getElementById("messagesContainer");

async function renderMessages() {

  try {
    const response = await fetch('http://localhost:8080/api/emails');

    if(!response.ok){
      throw new Error('messages not fetched');
    }

    const messages = await response.json();
    console.log(messages);

    messagesContainer.innerHTML = "";
    if (messages.length === 0) {
        messagesContainer.innerHTML = "<p>No messages found.</p>";
        return;
    }

    messages.forEach(msg => {
        const card = document.createElement("div");
        card.classList.add("message-card");

        card.innerHTML = `
            <div class="message-id">ID: ${msg.gmailId}</div>
            <div class="sender-email">${msg.senderEmail}</div>
            <div class="subject">${msg.subject}</div>
            <div class="content">${msg.content}</div>
        `;

        messagesContainer.appendChild(card);
    });

  } catch (error) {
    console.log(error)
  }

}

renderMessages();

socket.on("new_email",(msg)=>{
  console.log("New email recieved via socket!",msg);

  const card = document.createElement("div");
  card.classList.add("message-card");
  card.innerHTML = `
      <div class="message-id">ID: ${msg.gmailId}</div>
      <div class="sender-email">${msg.senderEmail}</div>
      <div class="subject">${msg.subject}</div>
      <div class="content">${msg.content}</div>
  `;

  messagesContainer.prepend(card);
  const emptyMsg = messagesContainer.querySelector("p");
  if (emptyMsg) emptyMsg.remove(); 
  
});

//the sending Message Part



