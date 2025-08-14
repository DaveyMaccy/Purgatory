/**
 * COMPLETE TASK DICTIONARY SYSTEM - Phase 1
 * 
 * This file contains the complete task system with categories, instructions,
 * and all job roles covered. Ready for immediate implementation.
 * 
 * File: src/core/world/task-dictionary.js
 */

/**
 * TASK CATEGORIES - Core task types with standard behaviors
 */
export const TASK_CATEGORIES = {
    DESK_WORK: {
        requiredLocation: 'desk',
        duration: 3600000, // 1 hour (60 minutes)
        baseInstructions: 'Sit at your desk and focus on work',
        completionActions: ['use_computer', 'use_computer', 'use_computer'],
        requiredItems: ['laptop'],
        skillModifiers: { competence: 1.2, laziness: 0.8 }
    },
    
    MEETING: {
        requiredLocation: 'meeting_room',
        duration: 2700000, // 45 minutes
        baseInstructions: 'Gather required attendees and conduct meeting',
        completionActions: ['call_meeting', 'conduct_discussion'],
        requiresAttendees: true,
        skillModifiers: { charisma: 1.3, leadership: 1.2 }
    },
    
    SUPERVISION: {
        requiredLocation: 'supervision',
        duration: 1800000, // 30 minutes
        baseInstructions: 'Walk around and check on team members',
        completionActions: ['find_target', 'observe_work', 'provide_feedback'],
        requiresTarget: true,
        skillModifiers: { leadership: 1.4, charisma: 1.1 }
    },
    
    PRINTING: {
        requiredLocation: 'printer',
        duration: 900000, // 15 minutes
        baseInstructions: 'Go to printer and handle document printing',
        completionActions: ['use_printer'],
        requiredItems: ['documents'],
        skillModifiers: { competence: 1.1 }
    },
    
    BREAK_ACTIVITY: {
        requiredLocation: 'break_room',
        duration: 1200000, // 20 minutes
        baseInstructions: 'Take a break and socialize',
        completionActions: ['relax', 'socialize'],
        skillModifiers: { social: 1.5 },
        restoresNeeds: { energy: 2, social: 3, stress: -2 }
    },
    
    CREATIVE_WORK: {
        requiredLocation: 'desk',
        duration: 4500000, // 75 minutes
        baseInstructions: 'Focus on creative tasks requiring inspiration',
        completionActions: ['brainstorm', 'create', 'refine'],
        requiredItems: ['laptop'],
        skillModifiers: { competence: 1.3, creativity: 1.5 }
    }
};

/**
 * COMPLETE TASK DICTIONARY - All 24 job roles covered
 */
export const TASK_DICTIONARY = {
    // ==================== LEGACY ROLES (Backward Compatibility) ====================
    'Manager': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Review Reports',
            description: 'Review team performance reports and financial data',
            instructions: 'Sit at your desk and analyze team reports. Use your computer to review performance metrics.',
            successMessages: ['Identified cost-saving opportunities', 'Found areas for team improvement', 'Completed quarterly analysis'],
            failureMessages: ['Got distracted during review', 'Reports were incomplete']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Team Meeting',
            description: 'Conduct weekly team status meeting',
            instructions: 'Call a meeting with your team members. Gather them in the meeting room to discuss progress.',
            requiredAttendees: ['any_subordinate', 'any_subordinate', 'any_subordinate'],
            successMessages: ['Productive team discussion held', 'Resolved blocking issues', 'Aligned team on priorities'],
            failureMessages: ['Meeting ran over time', 'Some team members were absent']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Team Check-in',
            description: 'Walk around and check on all team members',
            instructions: 'Leave your desk and walk around the office. Check on team members and see how they\'re doing.',
            requiresTarget: 'any_subordinate',
            successMessages: ['Found team working efficiently', 'Helped solve a team problem', 'Boosted team morale'],
            failureMessages: ['Found team member slacking', 'Discovered project delays']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Budget Planning',
            description: 'Work on department budget and resource allocation',
            instructions: 'Use your computer to plan the department budget and allocate resources.',
            successMessages: ['Created efficient budget plan', 'Optimized resource allocation'],
            failureMessages: ['Budget projections unclear', 'Resource conflicts found']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Reports',
            description: 'Print weekly team performance reports',
            instructions: 'Go to the printer and print out the weekly reports for distribution.',
            successMessages: ['Reports printed successfully', 'Distributed reports to team'],
            failureMessages: ['Printer jammed', 'Ran out of paper']
        }
    ],

    'Developer': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Write Code',
            description: 'Work on current software features and bug fixes',
            instructions: 'Sit at your desk and use your computer to write code. Focus on implementing new features.',
            successMessages: ['Implemented new user authentication', 'Fixed critical payment bug', 'Optimized database queries', 'Added new API endpoints'],
            failureMessages: ['Spent time debugging without progress', 'Got stuck on complex algorithm']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Debug Issues',
            description: 'Investigate and fix reported software bugs',
            instructions: 'Use your computer to investigate bug reports and fix software issues.',
            successMessages: ['Squashed 3 UI bugs', 'Fixed memory leak issue', 'Resolved crash on startup'],
            failureMessages: ['Bug proved elusive', 'Created new bug while fixing old one']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Code Review',
            description: 'Review team code and discuss improvements',
            instructions: 'Meet with other developers to review code and discuss improvements.',
            requiredAttendees: ['Developer', 'Lead Developer'],
            duration: 2700000, // 45 minutes
            successMessages: ['Found security vulnerability', 'Improved code quality', 'Shared best practices'],
            failureMessages: ['Review took too long', 'Disagreement on coding standards']
        },
        { 
            ...TASK_CATEGORIES.BREAK_ACTIVITY,
            displayName: 'Coffee Break',
            description: 'Take a break and chat with colleagues',
            instructions: 'Go to the break room, get some coffee, and socialize with coworkers.',
            successMessages: ['Had inspiring conversation', 'Learned about new technology', 'Relaxed and recharged'],
            failureMessages: ['Spilled coffee on shirt', 'Gossiped too much']
        }
    ],

    'Sales Rep': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Cold Calls',
            description: 'Make sales calls to potential clients',
            instructions: 'Use your phone at your desk to call potential customers and generate leads.',
            successMessages: ['Scheduled 3 client meetings', 'Generated hot lead', 'Closed small deal over phone'],
            failureMessages: ['Mostly voicemails left', 'Difficult customer complaints']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Update CRM',
            description: 'Update customer relationship management system',
            instructions: 'Use your computer to update client information and sales pipeline data.',
            successMessages: ['Updated 15 client records', 'Organized sales pipeline', 'Cleaned up old leads'],
            failureMessages: ['System was slow', 'Data entry errors made']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Client Meeting',
            description: 'Meet with potential or existing clients',
            instructions: 'Conduct a sales meeting with clients in the meeting room.',
            requiredAttendees: ['any_subordinate'], // Bring support staff
            successMessages: ['Closed major deal', 'Advanced sales pipeline', 'Built strong client rapport'],
            failureMessages: ['Client had budget concerns', 'Competitor offer was better']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Proposals',
            description: 'Print sales proposals for client meetings',
            instructions: 'Go to the printer and print out sales proposals and marketing materials.',
            successMessages: ['Proposals printed perfectly', 'Materials ready for presentation'],
            failureMessages: ['Printer out of color ink', 'Formatting issues found']
        }
    ],

    'Marketing': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Content Creation',
            description: 'Create marketing content and campaigns',
            instructions: 'Use your computer to create marketing materials, write copy, and design campaigns.',
            successMessages: ['Created viral social post', 'Designed compelling ad campaign', 'Wrote engaging blog article'],
            failureMessages: ['Creative block struck', 'Campaign concept rejected']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Social Media',
            description: 'Manage social media accounts and engagement',
            instructions: 'Monitor and update company social media accounts from your computer.',
            successMessages: ['Engagement up 25%', 'Viral post created', 'Crisis communication handled well'],
            failureMessages: ['Negative comments to handle', 'Post had typo']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Campaign Analysis',
            description: 'Analyze marketing campaign performance',
            instructions: 'Use analytics tools on your computer to measure campaign effectiveness.',
            successMessages: ['ROI exceeded targets', 'Identified optimization opportunities', 'Data insights discovered'],
            failureMessages: ['Campaign underperformed', 'Data was inconclusive']
        }
    ],

    'Intern': [
        { 
            ...TASK_CATEGORIES.BREAK_ACTIVITY,
            displayName: 'Coffee Run',
            description: 'Get coffee for the team',
            instructions: 'Go to the break room and prepare coffee for team members.',
            duration: 1800000, // 30 minutes
            successMessages: ['Everyone got their preferred order', 'Coffee machine fixed', 'Learned team preferences'],
            failureMessages: ['Spilled coffee', 'Forgot someone\'s order']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'File Organization',
            description: 'Organize and file documents',
            instructions: 'Organize physical and digital files at your desk workspace.',
            successMessages: ['Filing system improved', 'Found missing documents', 'Created efficient organization'],
            failureMessages: ['Files were more disorganized than expected', 'System crashed during organization']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Data Entry',
            description: 'Enter data into computer systems',
            instructions: 'Use your computer to input data accurately into various systems.',
            successMessages: ['Completed 200 records', 'No data entry errors', 'Finished ahead of schedule'],
            failureMessages: ['Made several typos', 'System kept freezing']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Copy Documents',
            description: 'Make copies of important documents',
            instructions: 'Use the printer/copier to duplicate documents as requested.',
            successMessages: ['All copies made perfectly', 'Organized copies efficiently'],
            failureMessages: ['Copier jammed repeatedly', 'Ran out of paper']
        }
    ],

    // ==================== GAME STUDIO ROLES ====================
    'Lead Developer': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Architecture Review',
            description: 'Review and plan system architecture decisions',
            instructions: 'Use your computer to design system architecture and review technical decisions.',
            duration: 4500000, // 75 minutes for complex work
            successMessages: ['Designed scalable microservice architecture', 'Planned database migration strategy', 'Resolved technical debt issues'],
            failureMessages: ['Architecture decisions proved complex', 'Team disagreed on approach']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Supervise Developers',
            description: 'Check on development team progress and provide guidance',
            instructions: 'Walk around and check on your development team. Provide guidance and help solve problems.',
            requiresTarget: 'Developer',
            successMessages: ['Helped junior dev with complex algorithm', 'Reviewed code quality with team', 'Unblocked team on technical issue'],
            failureMessages: ['Found team struggling with deadline', 'Discovered code quality issues']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Sprint Planning',
            description: 'Plan upcoming development sprint with team',
            instructions: 'Gather your development team in the meeting room to plan the next sprint.',
            requiredAttendees: ['Developer', 'Game Designer', 'QA Tester'],
            successMessages: ['Planned efficient 2-week sprint', 'Assigned tasks to team members', 'Identified potential blockers'],
            failureMessages: ['Sprint scope was too ambitious', 'Team capacity concerns raised']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Technical Documentation',
            description: 'Write technical specifications and documentation',
            instructions: 'Create technical documentation and specifications on your computer.',
            successMessages: ['Completed API documentation', 'Wrote clear setup instructions', 'Documented system architecture'],
            failureMessages: ['Documentation took longer than expected', 'Technical details were complex to explain']
        }
    ],

    'Game Designer': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Level Design',
            description: 'Design new game levels and gameplay mechanics',
            instructions: 'Use design tools on your computer to create engaging game levels and mechanics.',
            successMessages: ['Created engaging boss fight sequence', 'Designed challenging puzzle level', 'Balanced difficulty progression'],
            failureMessages: ['Level was too difficult for testers', 'Mechanics felt repetitive']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Gameplay Balancing',
            description: 'Adjust game mechanics for optimal player experience',
            instructions: 'Use your computer to analyze game data and adjust balance parameters.',
            successMessages: ['Balanced weapon damage values', 'Improved enemy AI behavior', 'Fixed progression issues'],
            failureMessages: ['Changes made game too easy', 'Player feedback was mixed']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Design Review',
            description: 'Present and discuss game design decisions',
            instructions: 'Meet with the team to present and discuss your design decisions.',
            requiredAttendees: ['Lead Developer', '3D Artist', 'Producer'],
            successMessages: ['Team approved new feature design', 'Got valuable feedback on mechanics', 'Aligned on creative vision'],
            failureMessages: ['Design conflicts with technical constraints', 'Team had concerns about scope']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Design Documentation',
            description: 'Write detailed game design documents',
            instructions: 'Create comprehensive design documents on your computer.',
            successMessages: ['Completed feature specification', 'Documented player progression system'],
            failureMessages: ['Document was unclear', 'Design was too complex']
        }
    ],

    '3D Artist': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Character Modeling',
            description: 'Create 3D character models and animations',
            instructions: 'Use 3D modeling software to create character models and animations.',
            duration: 5400000, // 90 minutes for complex creative work
            successMessages: ['Completed hero character model', 'Created enemy animation set', 'Rigged character for animation'],
            failureMessages: ['Model had topology issues', 'Animation felt stiff']
        },
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Environment Creation',
            description: 'Build 3D environments and world assets',
            instructions: 'Create 3D environments and world assets using modeling software.',
            successMessages: ['Finished castle courtyard scene', 'Created modular building pieces', 'Textured environment assets'],
            failureMessages: ['Scene was too performance heavy', 'Textures needed more detail']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Asset Optimization',
            description: 'Optimize 3D models for game performance',
            instructions: 'Use your computer to optimize 3D assets for better game performance.',
            successMessages: ['Reduced polygon count by 30%', 'Optimized texture memory usage', 'Improved rendering performance'],
            failureMessages: ['Quality loss was too noticeable', 'Optimization broke animations']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Reference Materials',
            description: 'Print concept art and reference images',
            instructions: 'Print out concept art and reference materials for your work.',
            successMessages: ['Printed high-quality references', 'Organized reference library'],
            failureMessages: ['Color printer was out of ink', 'References printed poorly']
        }
    ],

    'Sound Engineer': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Audio Recording',
            description: 'Record and edit audio for the game',
            instructions: 'Use audio equipment and software to record and edit game audio.',
            duration: 3600000, // 60 minutes
            successMessages: ['Recorded perfect voice line takes', 'Created atmospheric soundscape', 'Mixed audio levels perfectly'],
            failureMessages: ['Recording had background noise', 'Voice actor needed many retakes']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Sound Effect Creation',
            description: 'Create and edit sound effects',
            instructions: 'Use audio software to create compelling sound effects for game actions.',
            successMessages: ['Created impactful weapon sounds', 'Made realistic footstep audio', 'Designed unique creature sounds'],
            failureMessages: ['Effects didn\'t match visual impact', 'Sounds were too similar']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Audio Review',
            description: 'Review audio implementation with team',
            instructions: 'Meet with the team to review and discuss audio implementation.',
            requiredAttendees: ['Game Designer', 'Lead Developer'],
            successMessages: ['Team loved audio direction', 'Resolved audio timing issues', 'Aligned on audio vision'],
            failureMessages: ['Audio didn\'t fit game mood', 'Technical implementation issues found']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Audio Bug Fixing',
            description: 'Fix audio bugs and implementation issues',
            instructions: 'Debug and fix audio-related bugs using your computer.',
            successMessages: ['Fixed audio loop timing', 'Resolved sound cutting out', 'Improved audio performance'],
            failureMessages: ['Bug was in engine code', 'Fix caused new audio issues']
        }
    ],

    'QA Tester': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Bug Testing',
            description: 'Test game features and find bugs',
            instructions: 'Play the game systematically to find bugs and issues.',
            successMessages: ['Found critical crash bug', 'Discovered gameplay exploit', 'Identified UI inconsistencies'],
            failureMessages: ['No major bugs found today', 'Test build was unstable']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Test Case Writing',
            description: 'Write detailed test cases for game features',
            instructions: 'Create comprehensive test cases and procedures on your computer.',
            successMessages: ['Wrote 20 detailed test cases', 'Covered edge case scenarios', 'Documented test procedures clearly'],
            failureMessages: ['Test cases were too vague', 'Missed important scenarios']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Bug Review',
            description: 'Review found bugs with development team',
            instructions: 'Meet with developers to review and prioritize found bugs.',
            requiredAttendees: ['Developer', 'Lead Developer'],
            successMessages: ['Prioritized critical bugs', 'Clarified reproduction steps', 'Helped plan bug fixes'],
            failureMessages: ['Developers couldn\'t reproduce bugs', 'Priority disagreements arose']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Test Reports',
            description: 'Print test results and bug reports',
            instructions: 'Print out test reports and bug documentation for distribution.',
            successMessages: ['Reports printed cleanly', 'Organized test documentation'],
            failureMessages: ['Printer ran out of toner', 'Report formatting was off']
        }
    ],

    'Producer': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Project Planning',
            description: 'Plan project milestones and coordinate teams',
            instructions: 'Use project management tools to plan milestones and coordinate team efforts.',
            successMessages: ['Created realistic milestone plan', 'Coordinated team schedules', 'Identified project risks'],
            failureMessages: ['Timeline was too optimistic', 'Resource conflicts discovered']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Team Supervision',
            description: 'Check on all team leads and project progress',
            instructions: 'Walk around and check on team leads. Monitor project progress across all departments.',
            requiresTarget: 'any_subordinate',
            successMessages: ['All teams on track for milestone', 'Resolved resource conflict between teams', 'Boosted team morale'],
            failureMessages: ['Found team behind schedule', 'Budget concerns discovered']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Milestone Review',
            description: 'Review project progress with team leads',
            instructions: 'Gather team leads to review progress toward project milestones.',
            requiredAttendees: ['Lead Developer', 'Game Designer', 'QA Tester'],
            successMessages: ['Milestone will be met on time', 'Identified scope adjustments needed', 'Team alignment achieved'],
            failureMessages: ['Major delays discovered', 'Scope creep identified']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Budget Management',
            description: 'Manage project budget and resources',
            instructions: 'Use financial tools to track and manage project budget.',
            successMessages: ['Budget is on track', 'Found cost savings', 'Optimized resource allocation'],
            failureMessages: ['Budget overrun detected', 'Unexpected costs arose']
        }
    ],

    // ==================== CORPORATE ROLES ====================
    'IT Specialist': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'System Maintenance',
            description: 'Maintain servers and network infrastructure',
            instructions: 'Use your computer to monitor and maintain IT systems and network infrastructure.',
            successMessages: ['Updated security patches', 'Optimized network performance', 'Prevented system downtime'],
            failureMessages: ['Server needed emergency restart', 'Network slowdown detected']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Troubleshooting',
            description: 'Resolve technical issues and user problems',
            instructions: 'Help users with technical problems and resolve system issues.',
            successMessages: ['Fixed email server issue', 'Resolved printing problems', 'Helped 10 users with issues'],
            failureMessages: ['Problem required vendor support', 'Users frustrated with downtime']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Security Updates',
            description: 'Install security updates and patches',
            instructions: 'Apply security updates and patches to keep systems secure.',
            successMessages: ['All systems patched successfully', 'Security vulnerability closed', 'No downtime during updates'],
            failureMessages: ['Update caused compatibility issues', 'Some systems couldn\'t be updated']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print IT Documentation',
            description: 'Print system documentation and user guides',
            instructions: 'Print out IT documentation and user guides for distribution.',
            successMessages: ['Documentation printed clearly', 'User guides distributed'],
            failureMessages: ['Printer network was down', 'Documentation was outdated']
        }
    ],

    'Admin Assistant': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Schedule Management',
            description: 'Manage calendars and schedule meetings',
            instructions: 'Use your computer to manage executive calendars and coordinate schedules.',
            successMessages: ['Scheduled all meetings efficiently', 'Resolved calendar conflicts', 'Coordinated team schedules'],
            failureMessages: ['Double-booked important meeting', 'Calendar system crashed']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Email Correspondence',
            description: 'Handle email communications and responses',
            instructions: 'Manage email inbox and respond to various correspondence.',
            successMessages: ['Inbox completely cleared', 'Responded to all urgent emails', 'Organized email filing system'],
            failureMessages: ['Important email missed', 'Email server was slow']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Document Preparation',
            description: 'Prepare and format various documents',
            instructions: 'Create and format documents, reports, and presentations.',
            successMessages: ['Documents formatted perfectly', 'Presentation slides completed', 'Reports proofread thoroughly'],
            failureMessages: ['Formatting was inconsistent', 'Document template corrupted']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Documents',
            description: 'Print and organize various office documents',
            instructions: 'Print requested documents and organize them for distribution.',
            successMessages: ['All documents printed on time', 'Organized distribution packets'],
            failureMessages: ['Printer was out of paper', 'Print quality was poor']
        }
    ],

    'Business Analyst': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Data Analysis',
            description: 'Analyze business data and create insights',
            instructions: 'Use analytical tools to examine business data and identify trends.',
            duration: 4500000, // 75 minutes for complex analysis
            successMessages: ['Discovered cost-saving opportunity', 'Identified market trend', 'Found process inefficiency'],
            failureMessages: ['Data was incomplete', 'Analysis results were inconclusive']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Report Generation',
            description: 'Create detailed business reports',
            instructions: 'Compile data analysis into comprehensive business reports.',
            successMessages: ['Completed quarterly analysis', 'Report highlighted key insights', 'Data visualization was clear'],
            failureMessages: ['Report deadline was tight', 'Charts were confusing']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Stakeholder Meeting',
            description: 'Present analysis findings to stakeholders',
            instructions: 'Present your analysis findings to business stakeholders.',
            requiredAttendees: ['Project Manager', 'HR Manager'],
            successMessages: ['Stakeholders approved recommendations', 'Presentation was well-received', 'Action items identified'],
            failureMessages: ['Stakeholders questioned methodology', 'Presentation ran long']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Analysis Reports',
            description: 'Print detailed analysis and charts',
            instructions: 'Print analysis reports and charts for stakeholder review.',
            successMessages: ['Charts printed in full color', 'Reports bound professionally'],
            failureMessages: ['Color charts printed in black/white', 'Binding machine jammed']
        }
    ],

    'HR Manager': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Employee Relations',
            description: 'Handle employee concerns and HR issues',
            instructions: 'Manage employee relations issues and HR documentation.',
            successMessages: ['Resolved workplace conflict', 'Improved employee satisfaction', 'Updated HR policies'],
            failureMessages: ['Employee complaint escalated', 'Policy interpretation was unclear']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Staff Check-in',
            description: 'Check in with employees about workplace satisfaction',
            instructions: 'Walk around and check in with employees about their work satisfaction.',
            requiresTarget: 'any_subordinate',
            successMessages: ['Employees reported high satisfaction', 'Identified training need', 'Boosted team morale'],
            failureMessages: ['Found unhappy employee', 'Workplace stress concerns raised']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Policy Meeting',
            description: 'Discuss workplace policies with management',
            instructions: 'Meet with management to review and update workplace policies.',
            requiredAttendees: ['Project Manager', 'Admin Assistant'],
            successMessages: ['Policy updates approved', 'Compliance issues resolved', 'Management alignment achieved'],
            failureMessages: ['Policy disagreements arose', 'Compliance requirements complex']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Recruitment Planning',
            description: 'Plan recruitment and hiring activities',
            instructions: 'Plan hiring needs and recruitment strategies.',
            successMessages: ['Identified hiring priorities', 'Created job descriptions', 'Planned interview process'],
            failureMessages: ['Budget constraints on hiring', 'Job requirements unclear']
        }
    ],

    'Project Manager': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Project Planning',
            description: 'Plan and coordinate project activities',
            instructions: 'Use project management tools to plan and track project progress.',
            successMessages: ['Created detailed project plan', 'Identified project dependencies', 'Resource allocation optimized'],
            failureMessages: ['Timeline was unrealistic', 'Resource conflicts discovered']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Team Supervision',
            description: 'Check on project team progress',
            instructions: 'Walk around and check on team members working on your projects.',
            requiresTarget: 'any_subordinate',
            successMessages: ['Team is ahead of schedule', 'Resolved project blocker', 'Team morale is high'],
            failureMessages: ['Found team behind schedule', 'Quality concerns identified']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Status Meeting',
            description: 'Conduct project status review meeting',
            instructions: 'Gather team for project status review and planning.',
            requiredAttendees: ['Business Analyst', 'IT Specialist', 'Admin Assistant'],
            successMessages: ['Project is on track', 'Issues identified and resolved', 'Team alignment achieved'],
            failureMessages: ['Major delays discovered', 'Scope changes requested']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Risk Management',
            description: 'Identify and plan for project risks',
            instructions: 'Analyze project risks and create mitigation strategies.',
            successMessages: ['Risk mitigation plan created', 'Identified potential issues early', 'Contingency plans developed'],
            failureMessages: ['Risks were difficult to quantify', 'Mitigation strategies costly']
        }
    ],

    'Accountant': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Financial Records',
            description: 'Maintain and update financial records',
            instructions: 'Use accounting software to maintain accurate financial records.',
            duration: 3600000, // 60 minutes
            successMessages: ['Reconciled all bank accounts', 'Updated general ledger', 'Found accounting discrepancy'],
            failureMessages: ['Numbers didn\'t balance', 'Software crashed during entry']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Budget Analysis',
            description: 'Analyze budgets and financial performance',
            instructions: 'Review budget performance and create financial analysis.',
            successMessages: ['Identified cost savings', 'Budget variance analyzed', 'Financial trends identified'],
            failureMessages: ['Budget overruns discovered', 'Analysis was complex']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Tax Preparation',
            description: 'Prepare tax documents and filings',
            instructions: 'Prepare tax documentation and ensure compliance.',
            duration: 4500000, // 75 minutes
            successMessages: ['Tax filing completed early', 'Found tax deductions', 'Compliance verified'],
            failureMessages: ['Tax code changes complicated filing', 'Documentation was missing']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Financial Reports',
            description: 'Print financial statements and reports',
            instructions: 'Print financial reports for management review.',
            successMessages: ['Reports printed with perfect formatting', 'Financial statements ready for review'],
            failureMessages: ['Printer ran out of toner mid-job', 'Report formatting issues']
        }
    ],

    // ==================== PR AGENCY ROLES ====================
    'Account Manager': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Client Relations',
            description: 'Manage client accounts and relationships',
            instructions: 'Use your computer and phone to maintain client relationships and handle account issues.',
            successMessages: ['Strengthened client relationship', 'Resolved client concerns', 'Upsold additional services'],
            failureMessages: ['Client expressed budget concerns', 'Competitor made better offer']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Supervise Account Team',
            description: 'Check on account team members and their work',
            instructions: 'Walk around and check on your account team members. Ensure client work is progressing.',
            requiresTarget: 'Copywriter',
            successMessages: ['Team is exceeding client expectations', 'Helped team solve client challenge', 'Quality of work is excellent'],
            failureMessages: ['Found team struggling with deadline', 'Client feedback was mixed']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Campaign Planning',
            description: 'Plan marketing campaigns with team',
            instructions: 'Meet with creative team to plan client marketing campaigns.',
            requiredAttendees: ['Creative Director', 'Copywriter', 'Social Media Manager'],
            successMessages: ['Campaign concept approved', 'Creative direction aligned', 'Timeline established'],
            failureMessages: ['Creative differences emerged', 'Budget constraints affected scope']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Client Materials',
            description: 'Print proposals and client presentation materials',
            instructions: 'Print client proposals and presentation materials.',
            successMessages: ['Proposals printed professionally', 'Materials ready for client meeting'],
            failureMessages: ['Color inconsistency in prints', 'Binding machine broken']
        }
    ],

    'Creative Director': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Creative Strategy',
            description: 'Develop creative strategies for client campaigns',
            instructions: 'Use your computer to develop innovative creative strategies and concepts.',
            duration: 5400000, // 90 minutes for complex creative work
            successMessages: ['Breakthrough creative concept developed', 'Strategy aligns with brand perfectly', 'Innovative approach identified'],
            failureMessages: ['Creative concept was too risky', 'Strategy didn\'t resonate with client']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Supervise Creative Team',
            description: 'Check on creative team and guide their work',
            instructions: 'Walk around and supervise your creative team. Provide artistic direction and feedback.',
            requiresTarget: 'any_subordinate',
            successMessages: ['Team produced outstanding work', 'Provided inspiring creative direction', 'Resolved creative differences'],
            failureMessages: ['Team was stuck on concept', 'Creative quality below standards']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Creative Brainstorming',
            description: 'Lead creative brainstorming sessions',
            instructions: 'Gather creative team for brainstorming and concept development.',
            requiredAttendees: ['Copywriter', 'Social Media Manager', 'Brand Strategist'],
            duration: 4500000, // 75 minutes for brainstorming
            successMessages: ['Generated 20 great ideas', 'Team built on each other\'s concepts', 'Found winning campaign angle'],
            failureMessages: ['Team had creative block', 'Ideas were too similar to existing campaigns']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Creative Review',
            description: 'Review and approve creative work',
            instructions: 'Review creative work from your team and provide feedback.',
            successMessages: ['Approved exceptional creative work', 'Provided constructive feedback', 'Elevated creative quality'],
            failureMessages: ['Work needed major revisions', 'Creative didn\'t meet brand standards']
        }
    ],

    'Social Media Manager': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Content Scheduling',
            description: 'Schedule and manage social media content',
            instructions: 'Use social media management tools to schedule and organize content.',
            successMessages: ['Week\'s content scheduled efficiently', 'Optimized posting times', 'Content calendar organized'],
            failureMessages: ['Scheduling tool had issues', 'Content approval delayed']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Community Management',
            description: 'Engage with social media community and respond to comments',
            instructions: 'Monitor social media accounts and engage with the community.',
            successMessages: ['Engagement rate increased 30%', 'Resolved customer service issue via social', 'Built strong community connection'],
            failureMessages: ['Negative comments required damage control', 'Engagement was lower than expected']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Analytics Review',
            description: 'Analyze social media performance metrics',
            instructions: 'Review social media analytics and performance data.',
            successMessages: ['Identified viral content patterns', 'ROI exceeded expectations', 'Audience insights discovered'],
            failureMessages: ['Metrics showed declining engagement', 'Analytics data was confusing']
        },
        { 
            ...TASK_CATEGORIES.BREAK_ACTIVITY,
            displayName: 'Trend Research',
            description: 'Research current social media trends',
            instructions: 'Research trending topics and social media trends for content inspiration.',
            duration: 1800000, // 30 minutes
            successMessages: ['Discovered emerging trend perfect for client', 'Found viral content format', 'Identified influencer opportunity'],
            failureMessages: ['Trends didn\'t align with brand', 'Information overload from research']
        }
    ],

    'Copywriter': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Ad Copy Writing',
            description: 'Write compelling advertising copy',
            instructions: 'Use your computer to write engaging advertising copy for various campaigns.',
            successMessages: ['Wrote copy that increased conversion 25%', 'Created memorable tagline', 'Copy perfectly captured brand voice'],
            failureMessages: ['Copy was too wordy', 'Brand voice was inconsistent']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Content Research',
            description: 'Research topics and gather information for content',
            instructions: 'Research topics and gather information to support your writing projects.',
            successMessages: ['Found compelling statistics', 'Discovered unique angle for story', 'Research provided rich content foundation'],
            failureMessages: ['Sources were unreliable', 'Research was time-consuming without clear direction']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Copy Review',
            description: 'Review copy with creative team and get feedback',
            instructions: 'Meet with team to review and refine copy work.',
            requiredAttendees: ['Creative Director', 'Account Manager'],
            successMessages: ['Copy approved with minor tweaks', 'Team provided excellent feedback', 'Copy direction strengthened'],
            failureMessages: ['Major copy revisions required', 'Copy missed brand message']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Copy Drafts',
            description: 'Print copy drafts for review and markup',
            instructions: 'Print copy drafts for team review and client presentation.',
            successMessages: ['Clean copy drafts printed', 'Review copies distributed to team'],
            failureMessages: ['Printer cut off text margins', 'Copy had formatting errors when printed']
        }
    ],

    'Media Planner': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Media Strategy',
            description: 'Develop media placement strategies',
            instructions: 'Use media planning tools to develop optimal media placement strategies.',
            successMessages: ['Strategy maximized reach within budget', 'Found cost-effective media mix', 'Identified underutilized channels'],
            failureMessages: ['Media costs exceeded budget', 'Audience reach was limited']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Budget Planning',
            description: 'Plan and allocate media budgets',
            instructions: 'Allocate media budgets across different channels and time periods.',
            successMessages: ['Budget allocated for maximum ROI', 'Found budget efficiencies', 'Negotiated better rates'],
            failureMessages: ['Budget was insufficient for goals', 'Rate increases affected allocation']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Media Review',
            description: 'Review media plans with team and clients',
            instructions: 'Present media plans to team and discuss optimization opportunities.',
            requiredAttendees: ['Account Manager', 'Creative Director'],
            successMessages: ['Media plan approved enthusiastically', 'Found synergies with creative strategy', 'Budget optimization identified'],
            failureMessages: ['Client requested major changes', 'Media mix didn\'t align with creative']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Media Plans',
            description: 'Print media plans and budget breakdowns',
            instructions: 'Print detailed media plans and budget allocations for review.',
            successMessages: ['Media plans printed clearly', 'Charts and graphs displayed well'],
            failureMessages: ['Complex charts didn\'t print clearly', 'Formatting was cramped']
        }
    ],

    'Brand Strategist': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Brand Analysis',
            description: 'Analyze brand positioning and competitive landscape',
            instructions: 'Conduct deep brand analysis using research tools and strategic frameworks.',
            duration: 5400000, // 90 minutes for strategic work
            successMessages: ['Identified brand differentiation opportunity', 'Competitive analysis revealed market gap', 'Brand positioning strengthened'],
            failureMessages: ['Market research was contradictory', 'Brand positioning was unclear']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Strategy Development',
            description: 'Develop comprehensive brand strategies',
            instructions: 'Create detailed brand strategy documents and frameworks.',
            successMessages: ['Strategy framework completed', 'Brand roadmap developed', 'Strategic priorities clarified'],
            failureMessages: ['Strategy was too complex', 'Framework needed simplification']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Brand Workshop',
            description: 'Conduct brand strategy workshops with team',
            instructions: 'Lead strategic workshops to align team on brand direction.',
            requiredAttendees: ['Creative Director', 'Account Manager', 'Copywriter'],
            duration: 4500000, // 75 minutes for workshop
            successMessages: ['Team aligned on brand vision', 'Workshop generated actionable insights', 'Brand strategy clarified'],
            failureMessages: ['Team had conflicting brand perspectives', 'Workshop objectives unclear']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Strategy Documents',
            description: 'Print brand strategy documents and frameworks',
            instructions: 'Print comprehensive brand strategy documentation.',
            successMessages: ['Strategy documents printed professionally', 'Frameworks displayed clearly'],
            failureMessages: ['Document was too long for binding', 'Strategic diagrams printed poorly']
        }
    ],

    // ==================== NEWSPAPER ROLES ====================
    'Reporter': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Story Research',
            description: 'Research stories and gather information',
            instructions: 'Use your computer and phone to research stories and gather facts.',
            duration: 3600000, // 60 minutes
            successMessages: ['Uncovered important story angle', 'Found reliable sources', 'Gathered compelling evidence'],
            failureMessages: ['Sources were unresponsive', 'Information was difficult to verify']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Article Writing',
            description: 'Write news articles and stories',
            instructions: 'Write compelling news articles using your research and interviews.',
            duration: 4500000, // 75 minutes
            successMessages: ['Wrote engaging lead paragraph', 'Article met word count perfectly', 'Story had strong narrative flow'],
            failureMessages: ['Article deadline was tight', 'Story angle needed refocusing']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Editorial Meeting',
            description: 'Attend editorial planning meetings',
            instructions: 'Meet with editorial team to discuss story assignments and priorities.',
            requiredAttendees: ['Editor', 'Copy Editor'],
            successMessages: ['Got assignment for front-page story', 'Editorial team loved story pitch', 'Clear story direction established'],
            failureMessages: ['Story pitch was rejected', 'Assignment was changed last minute']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Story Drafts',
            description: 'Print article drafts for review and editing',
            instructions: 'Print story drafts for editorial review and markup.',
            successMessages: ['Clean drafts printed for review', 'Articles formatted properly'],
            failureMessages: ['Printer double-spaced incorrectly', 'Text was cut off at margins']
        }
    ],

    'Editor': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Article Review',
            description: 'Review and edit submitted articles',
            instructions: 'Review reporter articles and provide editorial feedback.',
            successMessages: ['Improved article clarity significantly', 'Found factual error before print', 'Enhanced story structure'],
            failureMessages: ['Article needed major rewrite', 'Deadline pressure affected editing quality']
        },
        { 
            ...TASK_CATEGORIES.SUPERVISION,
            displayName: 'Supervise Reporters',
            description: 'Check on reporter progress and provide guidance',
            instructions: 'Walk around and check on your reporters. Provide guidance on their stories.',
            requiresTarget: 'Reporter',
            successMessages: ['Helped reporter find story angle', 'Reporter is ahead of deadline', 'Story quality is excellent'],
            failureMessages: ['Reporter is behind on deadline', 'Story needs major direction change']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Editorial Planning',
            description: 'Plan newspaper content and story assignments',
            instructions: 'Meet with editorial team to plan newspaper content and assign stories.',
            requiredAttendees: ['Reporter', 'Copy Editor', 'Layout Designer'],
            successMessages: ['Strong story lineup planned', 'Reporter assignments optimized', 'Editorial calendar organized'],
            failureMessages: ['Not enough strong stories for issue', 'Reporter availability conflicts']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Page Proofs',
            description: 'Print newspaper page proofs for final review',
            instructions: 'Print page proofs for final review before publication.',
            successMessages: ['Page proofs printed perfectly', 'Layout looks professional'],
            failureMessages: ['Proof colors were off', 'Page formatting had issues']
        }
    ],

    'Photographer': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Photo Editing',
            description: 'Edit and process photographs',
            instructions: 'Use photo editing software to process and enhance photographs.',
            duration: 3600000, // 60 minutes
            successMessages: ['Photos enhanced beautifully', 'Corrected lighting issues perfectly', 'Created compelling photo story'],
            failureMessages: ['Photo quality was poor to start', 'Editing software crashed']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Photo Selection',
            description: 'Select best photos for publication',
            instructions: 'Review and select the best photographs for newspaper publication.',
            successMessages: ['Selected powerful front-page photo', 'Photo series tells compelling story', 'Images complement articles well'],
            failureMessages: ['Limited good photos to choose from', 'Photos didn\'t match story tone']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Assignment Planning',
            description: 'Plan photo assignments with editorial team',
            instructions: 'Meet with editorial team to plan photography assignments.',
            requiredAttendees: ['Editor', 'Reporter'],
            successMessages: ['Photo assignments aligned with stories', 'Creative photo concepts developed', 'Shooting schedule optimized'],
            failureMessages: ['Assignment conflicts with other shoots', 'Photo concepts were unclear']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Contact Sheets',
            description: 'Print contact sheets and photo proofs',
            instructions: 'Print contact sheets and photo proofs for review and selection.',
            successMessages: ['Contact sheets printed clearly', 'Photo quality reproduced well'],
            failureMessages: ['Photos printed too dark', 'Contact sheet layout was cramped']
        }
    ],

    'Layout Designer': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Page Layout',
            description: 'Design newspaper page layouts',
            instructions: 'Use design software to create compelling newspaper page layouts.',
            duration: 4500000, // 75 minutes
            successMessages: ['Front page layout is eye-catching', 'Page flow guides reader perfectly', 'Design balances text and images well'],
            failureMessages: ['Layout felt cluttered', 'Headlines didn\'t fit properly']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Typography Work',
            description: 'Work on typography and text formatting',
            instructions: 'Perfect typography and text formatting for newspaper pages.',
            successMessages: ['Typography is highly readable', 'Text hierarchy is clear', 'Font choices enhance readability'],
            failureMessages: ['Font sizing was inconsistent', 'Typography felt dated']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Design Review',
            description: 'Review layouts with editorial team',
            instructions: 'Present page layouts to editorial team for review and approval.',
            requiredAttendees: ['Editor', 'Photographer'],
            successMessages: ['Layouts approved enthusiastically', 'Design enhanced story impact', 'Editorial team loved visual approach'],
            failureMessages: ['Major layout changes requested', 'Design didn\'t match editorial vision']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Layout Proofs',
            description: 'Print layout proofs for review',
            instructions: 'Print high-quality layout proofs for editorial review.',
            successMessages: ['Proofs printed with perfect color accuracy', 'Layout details visible clearly'],
            failureMessages: ['Color calibration was off', 'Fine details didn\'t print clearly']
        }
    ],

    'Copy Editor': [
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Proofreading',
            description: 'Proofread articles for errors',
            instructions: 'Carefully proofread articles for grammar, spelling, and factual errors.',
            duration: 3600000, // 60 minutes
            successMessages: ['Caught 15 errors before print', 'Improved article readability', 'Ensured style guide compliance'],
            failureMessages: ['Missed subtle error', 'Deadline pressure affected thoroughness']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Fact Verification',
            description: 'Verify facts and check sources',
            instructions: 'Verify facts mentioned in articles and check source credibility.',
            successMessages: ['Confirmed all facts are accurate', 'Found unreliable source', 'Prevented factual error from printing'],
            failureMessages: ['Some facts were unverifiable', 'Source verification took longer than expected']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Style Guide Review',
            description: 'Review style guide compliance with team',
            instructions: 'Meet with editorial team to review and update style guide standards.',
            requiredAttendees: ['Editor', 'Reporter'],
            successMessages: ['Style guide updated with new standards', 'Team aligned on style decisions', 'Consistency improved across publication'],
            failureMessages: ['Style disagreements among team', 'New guidelines were complex']
        },
        { 
            ...TASK_CATEGORIES.PRINTING,
            displayName: 'Print Corrected Drafts',
            description: 'Print corrected article drafts',
            instructions: 'Print final corrected versions of articles for publication.',
            successMessages: ['Clean final drafts printed', 'All corrections clearly marked'],
            failureMessages: ['Corrections weren\'t saved properly', 'Print formatting changed corrections']
        }
    ],

    'Columnist': [
        { 
            ...TASK_CATEGORIES.CREATIVE_WORK,
            displayName: 'Column Writing',
            description: 'Write opinion columns and commentary',
            instructions: 'Write engaging opinion columns on current topics.',
            duration: 4500000, // 75 minutes
            successMessages: ['Column sparked reader discussion', 'Unique perspective on current issue', 'Writing voice was strong and clear'],
            failureMessages: ['Topic was too controversial', 'Column lacked clear point of view']
        },
        { 
            ...TASK_CATEGORIES.DESK_WORK,
            displayName: 'Opinion Research',
            description: 'Research topics for opinion pieces',
            instructions: 'Research current events and topics for column writing.',
            successMessages: ['Found compelling angle on current issue', 'Research revealed surprising facts', 'Multiple column ideas generated'],
            failureMessages: ['Topic was oversaturated', 'Research sources conflicted']
        },
        { 
            ...TASK_CATEGORIES.MEETING,
            displayName: 'Editorial Discussion',
            description: 'Discuss column topics with editorial team',
            instructions: 'Meet with editorial team to discuss column topics and editorial stance.',
            requiredAttendees: ['Editor', 'Reporter'],
            successMessages: ['Editorial team endorsed column direction', 'Found balance for controversial topic', 'Column aligned with publication values'],
            failureMessages: ['Editorial disagreement on topic', 'Column timing was problematic']
        },
        { 
            ...TASK_CATEGORIES.BREAK_ACTIVITY,
            displayName: 'Inspiration Time',
            description: 'Take time for creative inspiration',
            instructions: 'Take a break to find inspiration for your next column.',
            duration: 1800000, // 30 minutes
            successMessages: ['Found inspiration for next column', 'Conversation sparked column idea', 'Creative block lifted'],
            failureMessages: ['Still struggling with writer\'s block', 'No interesting conversations today']
        }
    ]
};

/**
 * Get meeting attendees for a specific task
 * @param {Object} task - Task object
 * @param {Array} availableCharacters - Characters in the office
 * @returns {Array} List of character IDs to invite
 */
export function getMeetingAttendees(task, availableCharacters) {
    if (!task.requiredAttendees) return [];
    
    const attendees = [];
    
    task.requiredAttendees.forEach(requirement => {
        if (requirement === 'any_subordinate') {
            // Find any subordinate
            const subordinate = availableCharacters.find(char => 
                !char.isPlayer && char.jobRole !== task.assignedTo?.jobRole
            );
            if (subordinate) attendees.push(subordinate.id);
        } else {
            // Find specific job role
            const specific = availableCharacters.find(char => char.jobRole === requirement);
            if (specific) attendees.push(specific.id);
        }
    });
    
    return attendees;
}

/**
 * Get supervision target for a task
 * @param {Object} task - Task object  
 * @param {Array} availableCharacters - Characters in the office
 * @returns {string|null} Character ID to supervise
 */
export function getSupervisionTarget(task, availableCharacters) {
    if (!task.requiresTarget) return null;
    
    if (task.requiresTarget === 'any_subordinate') {
        const subordinates = availableCharacters.filter(char => 
            !char.isPlayer && char.jobRole !== task.assignedTo?.jobRole
        );
        return subordinates[Math.floor(Math.random() * subordinates.length)]?.id;
    } else {
        const target = availableCharacters.find(char => char.jobRole === task.requiresTarget);
        return target?.id || null;
    }
}

/**
 * Get all available job roles
 * @returns {Array} Array of job role strings
 */
export function getAllJobRoles() {
    return Object.keys(TASK_DICTIONARY);
}

/**
 * Get tasks for a specific job role
 * @param {string} jobRole - The job role to get tasks for
 * @returns {Array} Array of task objects for the job role
 */
export function getTasksForRole(jobRole) {
    return TASK_DICTIONARY[jobRole] || [];
}

/**
 * Get a random task for a specific job role
 * @param {string} jobRole - The job role to get a task for
 * @param {string} excludeTask - Optional task name to exclude (avoid repetition)
 * @returns {Object|null} Random task object or null if no tasks available
 */
export function getRandomTaskForRole(jobRole, excludeTask = null) {
    const tasks = getTasksForRole(jobRole);
    
    if (tasks.length === 0) return null;
    
    // Filter out excluded task if provided and there are other options
    let availableTasks = tasks;
    if (excludeTask && tasks.length > 1) {
        availableTasks = tasks.filter(task => task.displayName !== excludeTask);
        // If filtering removed all tasks, use original list
        if (availableTasks.length === 0) {
            availableTasks = tasks;
        }
    }
    
    return availableTasks[Math.floor(Math.random() * availableTasks.length)];
}

/**
 * Validate task dictionary structure
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateTaskDictionary() {
    const errors = [];
    const requiredFields = ['displayName', 'description', 'instructions'];
    
    for (const [jobRole, tasks] of Object.entries(TASK_DICTIONARY)) {
        if (!Array.isArray(tasks)) {
            errors.push(`${jobRole}: tasks must be an array`);
            continue;
        }
        
        tasks.forEach((task, index) => {
            // Check required fields
            requiredFields.forEach(field => {
                if (!(field in task)) {
                    errors.push(`${jobRole}[${index}]: missing required field '${field}'`);
                }
            });
            
            // Validate duration
            if (task.duration && (typeof task.duration !== 'number' || task.duration <= 0)) {
                errors.push(`${jobRole}[${index}]: duration must be a positive number`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

console.log('📋 Complete Task Dictionary System loaded - All 24 job roles covered');
