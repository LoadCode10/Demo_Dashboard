import { format } from "https://cdn.jsdelivr.net/npm/date-fns@3.6.0/+esm";

let initialized = false;

export function manageAllMembers(membersElms){
  if(initialized) return;
  initialized = true;
  const {
    searchMembersInput,
    createMemberBtn,
    memberModal,
    closeMemberBtn,
    saveMemberBtn,
    updateMemberBtn,
    fullnameInput,
    cinInput,
    profileInput,
    departementInput,
    hiredateInput,
    emailInput,
    phonenumInput,
    teamGrid,
    saveBtn,
    modalEmail,
    teamHeaderDate,
    memberTaskModal,
    closeMemberModal,
    memberNameEl,
    memberTaskCount,
    memberTaskList
  } = membersElms;

  const date = new Date();
  const formattedDate = format(date,"MMMM dd, yyyy");
  teamHeaderDate.innerHTML = `${formattedDate}`;

  async function openEmailModal(id){
    try {
      const response = await fetch(`http://localhost:8080/api/members/${id}`);

      if(!response.ok){
        throw new Error("memberInfo not fetched");
      }
      const memberInfo = await response.json();

      modalEmail.style.display = 'flex';
      modalEmail.innerHTML = `
        <div class="glass-modal">
          <div class="modal-header-email">
            <h3>Send Email to: <span id="targetMemberName">${memberInfo.fullName}</span></h3>
            <button class="close-btn-email">✕</button>
          </div>

          <form id="emailForm">
            <div class="input-group-email">
              <input type="text" id="memberEmail" disabled>
            </div>

            <div class="input-group-email">
              <input type="text" id="emailSubject" placeholder="Subject" required>
            </div>

            <div class="input-group-email">
              <textarea id="emailBody" placeholder="Write your message here..." required></textarea>
            </div>

            <button type="submit" class="send-btn">
              Send via Gmail 🚀
            </button>
          </form>
        </div>
      `;

      document.getElementById('memberEmail').value = memberInfo.email;

      const closeEmailBtn = document.querySelector('.close-btn-email');

      closeEmailBtn.addEventListener('click',()=>{
        closeModal();
      });

      const formEmail = document.getElementById("emailForm");

      formEmail.addEventListener("submit",async (e)=>{
        e.preventDefault();
        const recipientEmail = document.getElementById("memberEmail").value;
        const subject = document.getElementById("emailSubject").value.trim();
        const messageContent = document.getElementById("emailBody").value.trim();
        console.log({ recipientEmail, subject, messageContent });
        try {
          await sendMessage(recipientEmail,subject,messageContent);
        } catch (error) {
          console.error(error);
          console.log("Failed to send email");
        }
      })
      
    } catch (error) {
      console.log(error);
    }
  }

  function closeModal() {
    modalEmail.style.display = "none";
    modalEmail.innerHTML = '';
  }

  createMemberBtn.addEventListener('click',()=>{
    memberModal.classList.add('active');
    updateMemberBtn.style.display = 'none';
    saveBtn.style.display = 'block'; 
    selectedMemberId = null;
  });

  closeMemberBtn.addEventListener('click',async ()=>{
    memberModal.classList.remove('active');
    await clearMemberfields();
  });

  saveMemberBtn.addEventListener('submit',async (e)=>{
    e.preventDefault();
    try {
      const fullName = fullnameInput.value.trim();
      const cin = cinInput.value.trim();
      const profil = profileInput.value.trim();
      const departement = departementInput.value.trim();
      const hiredDate = hiredateInput.value.trim();
      const email = emailInput.value.trim();
      const phoneNum = phonenumInput.value.trim();

      await addNewMember(fullName,cin,profil,departement,hiredDate,email,phoneNum);
      
    } catch (error) {
      console.log(error);
    }
  });

  async function addNewMember(fullName,cin,profil,departement,hiredDate,email,phoneNum){
    
    try {
      const response = await fetch('http://localhost:8080/api/members',{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
          fullName,
          cin,
          profil,
          departement,
          hiredDate,
          email,
          phoneNum
        })
      });

      const addedMember = await response.json();

      if(!response.ok){
        throw new Error('your member not added yet');
      }

      console.log(addedMember);
      memberModal.classList.remove('active');

      renderMembers();

      clearMemberfields();

    } catch (error) {
      console.log(error);
    }
  }

  async function renderMembers(){
    try {
      const response = await fetch('http://localhost:8080/api/members',{
        method: 'GET'
      });

      const allMembers = await response.json();

      console.log(allMembers);

      teamGrid.innerHTML = "";

      allMembers.forEach(member => {
        const div = document.createElement('div');
        div.classList.add('team-card');
        div.innerHTML = `
          <span class="status">
              <i class="fa-solid fa-trash delete-member" data-member-id = "${member._id}"></i>
              <i class="fa-regular fa-pen-to-square edit-member" data-member-id = "${member._id}"></i>
              <i class="fa-solid fa-circle-info info-member" data-member-id = "${member._id}"></i>
              <i class="fa-regular fa-envelope send-email" data-member-id = "${member._id}"></i>
            </span>
          <img src="https://i.pravatar.cc/100?img=11" class="avatar">
          <h3>${member.fullName}</h3>
          <p class="role">${member.profil}</p>

          <div class="info">
            <p><strong>Department:</strong> ${member.departement}</p>
            <p><strong>Hired:</strong> ${new Date(member.hiredDate).toISOString().split('T')[0]}</p>
          </div>

          <div class="contact">
            <span>📧 ${member.email}</span>
            <span>📞 (+212) ${member.phoneNum}</span>
          </div>
        `;

        teamGrid.appendChild(div);
      })

    } catch (error) {
      console.log(error);
    }
  };

  let selectedMemberId = null;
  async function memberById(){
    teamGrid.addEventListener('click',async(e)=>{
      const target = e.target;
      selectedMemberId = target.dataset.memberId;
      console.log(selectedMemberId);

      if(target.classList.contains('edit-member')){
        //edit member logic here;
        const memberId = target.dataset.memberId;
        // console.log(`edit member : ${memberId}`);
        await loadMemberModal(memberId);
        // await getMemberTasks(memberId);
      };

      if(target.classList.contains('delete-member')){
        console.log(`member id: ${selectedMemberId} was deleted`);
        await deleteMember(selectedMemberId);
      };

      if(target.classList.contains('info-member')){
        await getMemberTasks(selectedMemberId);
      }

      if(target.classList.contains('send-email')){
        await openEmailModal(selectedMemberId);
      }
    })
  };

  async function deleteMember(id){
    try {
      const response = await fetch(`http://localhost:8080/api/members/${id}`,{
        method: 'DELETE'
      });

      if(!response.ok){
        throw new Error(`we can't delete member`);
      }

      const deletedMember = await response.json();
      console.log(deletedMember);
      renderMembers();

    } catch (error) {
      console.log(error);
    }
  };

  updateMemberBtn.addEventListener('click',async ()=>{
    await updateSelectedMember();
    memberModal.classList.remove('active');
    saveBtn.style.display = "block";
    updateMemberBtn.style.display = "none";
    clearMemberfields();
  })

  async function loadMemberModal(id){
    selectedMemberId = id;
    memberModal.classList.add('active');
    updateMemberBtn.style.display = 'block';
    saveBtn.style.display = "none";
    try {
      const response = await fetch(`http://localhost:8080/api/members/${id}`);

      if(!response.ok){
        throw new Error("Member not Loaded");
      }

      const memberLoaded = await response.json();

      console.log(memberLoaded);

      fullnameInput.value = memberLoaded.fullName;
      cinInput.value = memberLoaded.cin;
      profileInput.value = memberLoaded.profil;
      departementInput.value = memberLoaded.departement;
      hiredateInput.value = new Date(memberLoaded.hiredDate).toISOString().split('T')[0];
      emailInput.value = memberLoaded.email;
      phonenumInput.value = memberLoaded.phoneNum;

    } catch (error) {
      console.log(error);
    }
  }

  async function clearMemberfields(){
    fullnameInput.value = '';
    cinInput.value = '';
    profileInput.value = '';
    departementInput.value = '';
    hiredateInput.value = '';
    emailInput.value = '';
    phonenumInput.value = '';
  }

  async function updateSelectedMember(){
    if(!selectedMemberId) return;
    try {
      const fullName = fullnameInput.value.trim();
      const cin = cinInput.value.trim();
      const profil = profileInput.value.trim();
      const departement = departementInput.value.trim();
      const hiredDate = hiredateInput.value.trim();
      const email = emailInput.value.trim();
      const phoneNum = phonenumInput.value.trim();

      const response = await fetch(`http://localhost:8080/api/members/${selectedMemberId}`,{
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          fullName,
          cin,
          profil,
          departement,
          hiredDate,
          email,
          phoneNum
        })
      });

      if(!response.ok){
        throw new Error(`Your Member does't Updated`);
      }

      const updatedMember = await response.json();
      console.log("Member Updated Successffully");
      console.log(updatedMember);

      selectedMemberId = null;
      renderMembers();

    } catch (error) {
      console.log(error);
    }
  }

  async function searchMembers(keyword){
    try {
      const url = keyword
        ? `http://localhost:8080/api/members?search=${encodeURIComponent(keyword)}`
        : `http://localhost:8080/api/members`;
      
      const response = await fetch(url);
      if(!response.ok){
        throw new Error('Search not working');
      }
      const searchedMembers = await response.json();
      console.log(searchedMembers);
      renderSerchedMembers(searchedMembers)
    } catch (error) {
      console.log(error);
    }
  }

  let debounceTimer;
  searchMembersInput.addEventListener('input',async (e)=>{
    clearInterval(debounceTimer);
    debounceTimer = setTimeout(async()=>{
      await searchMembers(e.target.value);
    },300);
  });

  async function renderSerchedMembers(searchedMembers){
    teamGrid.innerHTML = "";
    searchedMembers.forEach(member => {
      const div = document.createElement('div');
      div.classList.add('team-card');
      div.innerHTML = `
        <span class="status">
            <i class="fa-solid fa-trash delete-member" data-member-id = "${member._id}"></i>
            <i class="fa-regular fa-pen-to-square edit-member" data-member-id = "${member._id}"></i>
          </span>
        <img src="https://i.pravatar.cc/100?img=11" class="avatar">
        <h3>${member.fullName}</h3>
        <p class="role">${member.profil}</p>

        <div class="info">
          <p><strong>Department:</strong> ${member.departement}</p>
          <p><strong>Hired:</strong> ${new Date(member.hiredDate).toISOString().split('T')[0]}</p>
        </div>

        <div class="contact">
          <span>📧 ${member.email}</span>
          <span>📞 (+212) ${member.phoneNum}</span>
        </div>
      `;

      teamGrid.appendChild(div);
    })
  }

  async function getMemberTasks(memberId){
    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${memberId}/memberTasks`);

      if(!response.ok){
        throw new Error(`can't fetch tasks of member ${memberId}`);
      }

      const memberTasks = await response.json();
      console.log(memberTasks);
      await openMemberTaskModal(memberTasks[0].owner,memberTasks);

    } catch (error) {
      console.log(error);
    }
  }

  async function openMemberTaskModal(memberName,tasksArray){
    memberNameEl.textContent = `${memberName}'s Tasks`;
    memberTaskCount.textContent = tasksArray.length;
    memberTaskList.innerHTML = "";
    if(tasksArray.length === 0){
      memberTaskList.innerHTML = "<p>No tasks assigned.</p>";
    }else {
      tasksArray.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.classList.add("member-task-card");

        taskCard.innerHTML = `
          <h4>${task.title}</h4>
          <span class="status-task ${task.taskStatus.toLowerCase()}">
            ${task.taskStatus}
          </span>
          <span class="priority-task ${task.taskPriority.toLowerCase()}">
            ${task.taskPriority}
          </span>
        `;

        memberTaskList.appendChild(taskCard);
      });
    };
    memberTaskModal.style.display = "flex";
  }

  closeMemberModal.addEventListener("click", () => {
    memberTaskModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === memberTaskModal) {
      memberTaskModal.style.display = "none";
    }
  });

  async function sendMessage(recipientEmail,subject,messageContent){
    // console.log(`message sent to ${id}`);
    const response = await fetch("http://localhost:8080/api/emails/sendMail",{
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        recipientEmail,
        subject,
        messageContent
      })
    });

    if(!response.ok){
      throw new Error("message not Sent!");
    };

    const sentMessage = await response.json();
    console.log(sentMessage);
  }

  memberById();
  renderMembers();
}
