const Member = require('../model/Member');
const Task = require('../model/Task');

const getAllMembers = async (req,res)=>{
  try {
    const members = await Member.find();
    if(members.length === 0){
      return res.status(201).json({
        'message':'not member exists'
      });
    };

    return res.status(201).json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:"Server Error"
    });
  }
};

const creatNewMember = async (req,res)=>{
  const {
    fullName,
    cin,
    profil,
    departement,
    hiredDate,
    email,
    phoneNum
  } = req.body;

  if(!fullName || !cin || !profil || !departement || !hiredDate || !email || !phoneNum){
    return res.status(400).json({
      'message':'fullname, cin, profile, departement,hiredate,email,phone all are required'
    });
  };

  try {
    const newMember = await Member.create({
      fullName,
      cin,
      profil,
      departement,
      hiredDate,
      email,
      phoneNum
    });

    return res.status(201).json(newMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:"Server Error"
    });
  }
};

const deleteMember = async(req,res)=>{
  const {id} = req.params;
  const deletedMember = await Member.findByIdAndDelete(id);
  res.status(200).json(deletedMember);
}

const updateMember = async (req,res)=>{
  const {id} = req.params;
  const {
    fullName,
    cin,
    profil,
    departement,
    hiredDate,
    email,
    phoneNum
  } = req.body;

  try {
    const updatedMember = await Member.findByIdAndUpdate(
      id,{
        fullName,
        cin,
        profil,
        departement,
        hiredDate,
        email,
        phoneNum
      },
      {
        new: true,
        runValidators: true
      }
    );

    if(!updatedMember){
      return res.status(404).json({message: 'Member not Found'});
    }

    return res.status(200).json(updatedMember);

  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

const getMemberById = async (req,res)=>{
  const {id} = req.params;
  try {
    const selectedMember = await Member.findById(id);

    if(!selectedMember){
      return res.status(404).json({message: "Member not Found"});
    }

    return res.status(200).json(selectedMember);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message : error.message
    })
  }
}

const searchMemberQuery = async (req,res)=>{
  const {search} = req.query;

  const query = search 
    ?{
      $or:[
        {fullName: {$regex: search, $options:"i"}},
        {cin: {$regex: search, $options:"i"}},
        {profil: {$regex: search, $options:"i"}},
        {departement: {$regex: search, $options:"i"}},
        {email: {$regex: search, $options:"i"}},
        {phoneNum: {$regex: search, $options:"i"}},
      ]
    }:{};

  const members = await Member.find(query);

  res.json(members);
}

const getMembers = async (req,res)=>{
  if(req.query.search){
    return searchMemberQuery(req,res);
  }

  return getAllMembers(req,res);
}

const getMemberTasks = async (req,res)=>{
  const {memberId} = req.params;
  const memberTasks = await Task.find({member: memberId});

  res.json(memberTasks);
}

module.exports = {
  getAllMembers,
  creatNewMember,
  deleteMember,
  updateMember,
  getMemberById,
  searchMemberQuery,
  getMembers,
  getMemberTasks
}