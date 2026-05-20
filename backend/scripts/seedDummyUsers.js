require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const OrganizerProfile = require('../models/OrganizerProfile');
const WorkerProfile = require('../models/WorkerProfile');

const password = 'GigXpress@123';

const organizers = [
  ['Aarav Mehta', 'organizer01@gigxpress.test', '9876501001', 'Mehta Event Works', 'company', 'Mumbai', 'Maharashtra', '400001'],
  ['Priya Nair', 'organizer02@gigxpress.test', '9876501002', 'Nair Hospitality Group', 'company', 'Pune', 'Maharashtra', '411001'],
  ['Rohan Desai', 'organizer03@gigxpress.test', '9876501003', 'Desai Wedding Planners', 'individual', 'Ahmedabad', 'Gujarat', '380001'],
  ['Sneha Kulkarni', 'organizer04@gigxpress.test', '9876501004', 'Campus Connect Events', 'educational', 'Bengaluru', 'Karnataka', '560001'],
  ['Karan Malhotra', 'organizer05@gigxpress.test', '9876501005', 'Malhotra Exhibitions', 'company', 'Delhi', 'Delhi', '110001'],
  ['Neha Shah', 'organizer06@gigxpress.test', '9876501006', 'Shah Social Foundation', 'ngo', 'Surat', 'Gujarat', '395003'],
  ['Vikram Rao', 'organizer07@gigxpress.test', '9876501007', 'Rao Concert Crew', 'company', 'Hyderabad', 'Telangana', '500001'],
  ['Ananya Iyer', 'organizer08@gigxpress.test', '9876501008', 'Iyer Cultural Forum', 'ngo', 'Chennai', 'Tamil Nadu', '600001'],
  ['Sahil Khan', 'organizer09@gigxpress.test', '9876501009', 'Khan Sports Events', 'company', 'Jaipur', 'Rajasthan', '302001'],
  ['Meera Joshi', 'organizer10@gigxpress.test', '9876501010', 'Joshi Community Events', 'individual', 'Indore', 'Madhya Pradesh', '452001']
].map(([fullName, email, phone, organizationName, organizationType, city, state, pincode]) => ({
  fullName,
  email,
  phone,
  password,
  role: 'organizer',
  organizationName,
  organizationType,
  city,
  state,
  pincode
}));

const volunteers = [
  ['Aditya Sharma', 'volunteer01@gigxpress.test', '9876502001', '2000-02-14', 'male', 'Mumbai', 'Event Management', 'Hospitality'],
  ['Kavya Patel', 'volunteer02@gigxpress.test', '9876502002', '1999-07-21', 'female', 'Pune', 'Registration Desk', 'Crowd Management'],
  ['Manav Singh', 'volunteer03@gigxpress.test', '9876502003', '1998-11-03', 'male', 'Delhi', 'Technical Support', 'AV Setup'],
  ['Diya Reddy', 'volunteer04@gigxpress.test', '9876502004', '2001-04-18', 'female', 'Hyderabad', 'Photography', 'Marketing'],
  ['Arjun Verma', 'volunteer05@gigxpress.test', '9876502005', '1997-09-09', 'male', 'Jaipur', 'Crowd Management', 'Hospitality'],
  ['Isha Gupta', 'volunteer06@gigxpress.test', '9876502006', '2000-12-27', 'female', 'Ahmedabad', 'Decoration', 'Registration Desk'],
  ['Nikhil Bansal', 'volunteer07@gigxpress.test', '9876502007', '1996-05-15', 'male', 'Surat', 'AV Setup', 'Technical Support'],
  ['Tanya Kapoor', 'volunteer08@gigxpress.test', '9876502008', '2002-01-30', 'female', 'Bengaluru', 'Marketing', 'Event Management'],
  ['Rahul Jain', 'volunteer09@gigxpress.test', '9876502009', '1999-03-12', 'male', 'Chennai', 'Hospitality', 'Crowd Management'],
  ['Pooja Mishra', 'volunteer10@gigxpress.test', '9876502010', '1998-08-08', 'female', 'Indore', 'Registration Desk', 'Photography'],
  ['Yash Agarwal', 'volunteer11@gigxpress.test', '9876502011', '2001-06-25', 'male', 'Mumbai', 'Event Management', 'Decoration'],
  ['Ritika Soni', 'volunteer12@gigxpress.test', '9876502012', '2000-10-19', 'female', 'Pune', 'Hospitality', 'Marketing'],
  ['Devansh Chawla', 'volunteer13@gigxpress.test', '9876502013', '1997-02-05', 'male', 'Delhi', 'Technical Support', 'Crowd Management'],
  ['Mitali Bose', 'volunteer14@gigxpress.test', '9876502014', '1999-12-01', 'female', 'Kolkata', 'Photography', 'Registration Desk'],
  ['Omkar Patil', 'volunteer15@gigxpress.test', '9876502015', '2001-09-17', 'male', 'Nagpur', 'AV Setup', 'Event Management'],
  ['Simran Kaur', 'volunteer16@gigxpress.test', '9876502016', '1998-04-23', 'female', 'Chandigarh', 'Hospitality', 'Decoration'],
  ['Harsh Vyas', 'volunteer17@gigxpress.test', '9876502017', '1996-07-07', 'male', 'Vadodara', 'Crowd Management', 'Marketing'],
  ['Aditi Menon', 'volunteer18@gigxpress.test', '9876502018', '2002-03-29', 'female', 'Kochi', 'Registration Desk', 'Event Management'],
  ['Siddharth Roy', 'volunteer19@gigxpress.test', '9876502019', '1997-11-11', 'male', 'Kolkata', 'Technical Support', 'Photography'],
  ['Riya Saxena', 'volunteer20@gigxpress.test', '9876502020', '2000-05-02', 'female', 'Lucknow', 'Hospitality', 'Crowd Management']
].map(([fullName, email, phone, dateOfBirth, gender, city, skillOne, skillTwo], index) => ({
  fullName,
  email,
  phone,
  password,
  role: 'worker',
  dateOfBirth,
  gender,
  city,
  skills: [skillOne, skillTwo],
  experienceLevel: index % 3 === 0 ? 'experienced' : index % 3 === 1 ? 'intermediate' : 'beginner'
}));

async function upsertUser(account) {
  let user = await User.findOne({ email: account.email }).select('+password');

  if (!user) {
    user = new User({
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      password: account.password,
      role: account.role
    });
  } else {
    user.fullName = account.fullName;
    user.phone = account.phone;
    user.role = account.role;
    user.password = account.password;
  }

  user.isActive = true;
  user.isEmailVerified = true;
  user.isPhoneVerified = true;
  user.kycStatus = 'verified';
  user.kycDetails = {
    aadhaarNumber: account.role === 'worker' ? `99998888${account.phone.slice(-4)}` : undefined,
    aadhaarVerified: true,
    panNumber: `GXPRS${account.phone.slice(-4)}A`,
    panVerified: true
  };

  await user.save();
  return user;
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env before running this script.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const organizer of organizers) {
    const user = await upsertUser(organizer);
    await OrganizerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        organizationName: organizer.organizationName,
        organizationType: organizer.organizationType,
        gstNumber: null,
        address: {
          street: `Demo Street ${organizer.phone.slice(-2)}`,
          city: organizer.city,
          state: organizer.state,
          pincode: organizer.pincode,
          fullAddress: `Demo Street ${organizer.phone.slice(-2)}, ${organizer.city}, ${organizer.state} ${organizer.pincode}`
        },
        verified: true
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
  }

  for (const volunteer of volunteers) {
    const user = await upsertUser(volunteer);
    await WorkerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        dateOfBirth: new Date(volunteer.dateOfBirth),
        gender: volunteer.gender,
        location: {
          city: volunteer.city,
          state: '',
          pincode: ''
        },
        skills: volunteer.skills,
        experienceLevel: volunteer.experienceLevel,
        bio: `Demo volunteer profile for ${volunteer.fullName}.`,
        currentLevel: volunteer.experienceLevel === 'experienced' ? 'regular' : 'volunteer',
        reliabilityScore: 80,
        availability: {
          isAvailable: true,
          preferredDays: ['friday', 'saturday', 'sunday'],
          preferredShifts: ['morning', 'evening']
        }
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
  }

  console.log(`Seeded ${organizers.length} organizers and ${volunteers.length} volunteers.`);
  console.log('Credentials are listed in backend/dummy-credentials.md');
}

seed()
  .catch((error) => {
    console.error('Dummy user seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
