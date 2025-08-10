// Office schedule definitions
const OFFICE_SCHEDULE = {
  default: {
    start: 9.0,  // 9:00 AM
    end: 17.0    // 5:00 PM
  },
  'Senior Coder': {
    start: 10.0, // 10:00 AM
    end: 18.0    // 6:00 PM
  },
  'Manager': {
    start: 8.5,  // 8:30 AM
    end: 17.5    // 5:30 PM
  },
  'Intern': {
    start: 8.0,  // 8:00 AM
    end: 16.0    // 4:00 PM
  },
  'HR Specialist': {
    start: 9.5,  // 9:30 AM
    end: 17.5    // 5:30 PM
  },
  'Designer': {
    start: 10.5, // 10:30 AM
    end: 18.5    // 6:30 PM
  }
};

// Special schedules for different office types
const OFFICE_TYPE_SCHEDULES = {
  'Startup': {
    default: {
      start: 10.0,
      end: 19.0
    }
  },
  'Corporate': {
    default: {
      start: 8.0,
      end: 17.0
    }
  },
  'Remote': {
    default: {
      start: 0.0,
      end: 24.0
    }
  }
};

// Function to get schedule for a character
function getScheduleForCharacter(character, officeType = 'default') {
  const officeSchedule = OFFICE_TYPE_SCHEDULES[officeType] || OFFICE_TYPE_SCHEDULES.default;
  return OFFICE_SCHEDULE[character.jobRole] || officeSchedule.default || OFFICE_SCHEDULE.default;
}

module.exports = {
  OFFICE_SCHEDULE,
  OFFICE_TYPE_SCHEDULES,
  getScheduleForCharacter
};
