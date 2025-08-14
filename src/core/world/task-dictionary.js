/**
 * TASK DICTIONARY - Centralized task definitions for all job roles
 * 
 * Each task object structure:
 * - displayName: Human-readable task name
 * - requiredLocation: Where the task must be performed ('desk', 'meeting_room', 'break_room', 'printer')
 * - duration: Time in milliseconds to complete the task
 */

export const TASK_DICTIONARY = {
    // LEGACY ROLES (keep for backward compatibility)
    'Manager': [
        { displayName: 'Review Reports', requiredLocation: 'desk', duration: 45000 },
        { displayName: 'Attend Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Plan Strategy', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Budget Review', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Team Check-in', requiredLocation: 'meeting_room', duration: 30000 },
        { displayName: 'Performance Reviews', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Department Planning', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Print Weekly Reports', requiredLocation: 'printer', duration: 15000 }
    ],
    'Developer': [
        { displayName: 'Write Code', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Debug Issues', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Code Review', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Deploy Release', requiredLocation: 'desk', duration: 45000 },
        { displayName: 'Technical Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Documentation', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Testing', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Coffee Break', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Sales Rep': [
        { displayName: 'Cold Calls', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Update CRM', requiredLocation: 'desk', duration: 60000 },
        { displayName: 'Client Meeting', requiredLocation: 'meeting_room', duration: 75000 },
        { displayName: 'Proposal Writing', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Lead Follow-up', requiredLocation: 'desk', duration: 45000 },
        { displayName: 'Sales Training', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Print Proposals', requiredLocation: 'printer', duration: 10000 },
        { displayName: 'Network Coffee', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Marketing': [
        { displayName: 'Content Creation', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Social Media', requiredLocation: 'desk', duration: 60000 },
        { displayName: 'Campaign Analysis', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Design Review', requiredLocation: 'meeting_room', duration: 45000 },
        { displayName: 'Market Research', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Brand Planning', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Print Materials', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Creative Break', requiredLocation: 'break_room', duration: 15000 }
    ],
    'Intern': [
        { displayName: 'Coffee Run', requiredLocation: 'break_room', duration: 30000 },
        { displayName: 'File Organization', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Data Entry', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Copy Documents', requiredLocation: 'printer', duration: 25000 },
        { displayName: 'Meeting Notes', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Research Tasks', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Archive Files', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Supply Inventory', requiredLocation: 'break_room', duration: 40000 }
    ],

    // GAME STUDIO ROLES
    'Lead Developer': [
        { displayName: 'Code Architecture Review', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Supervise Developer Work', requiredLocation: 'supervision', duration: 45000, requiresTarget: 'Developer' },
        { displayName: 'Check on Team Progress', requiredLocation: 'supervision', duration: 30000, requiresTarget: 'any_subordinate' },
        { displayName: 'Team Code Review', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Debug Critical Issues', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Sprint Planning', requiredLocation: 'meeting_room', duration: 75000 },
        { displayName: 'Technical Documentation', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Coffee & Code Chat', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Game Designer': [
        { displayName: 'Level Design', requiredLocation: 'desk', duration: 200000 },
        { displayName: 'Gameplay Balancing', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Design Document Update', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Playtesting Session', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Feature Brainstorming', requiredLocation: 'meeting_room', duration: 75000 },
        { displayName: 'UI/UX Review', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Print Design Specs', requiredLocation: 'printer', duration: 15000 },
        { displayName: 'Creative Break', requiredLocation: 'break_room', duration: 25000 }
    ],
    '3D Artist': [
        { displayName: 'Character Modeling', requiredLocation: 'desk', duration: 240000 },
        { displayName: 'Environment Creation', requiredLocation: 'desk', duration: 220000 },
        { displayName: 'Texture Work', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Animation Review', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Asset Optimization', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Art Team Meeting', requiredLocation: 'meeting_room', duration: 45000 },
        { displayName: 'Render Test Prints', requiredLocation: 'printer', duration: 30000 },
        { displayName: 'Inspiration Break', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Sound Engineer': [
        { displayName: 'Audio Recording', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Sound Effect Creation', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Audio Implementation', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Audio Review Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Voice Acting Direction', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Audio Bug Fixing', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Print Audio Logs', requiredLocation: 'printer', duration: 15000 },
        { displayName: 'Listen & Relax', requiredLocation: 'break_room', duration: 25000 }
    ],
    'QA Tester': [
        { displayName: 'Bug Testing', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Regression Testing', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Test Case Writing', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Bug Report Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Compatibility Testing', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Test Plan Review', requiredLocation: 'meeting_room', duration: 45000 },
        { displayName: 'Print Test Reports', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'QA Team Break', requiredLocation: 'break_room', duration: 30000 }
    ],
    'Producer': [
        { displayName: 'Project Planning', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Team Supervision', requiredLocation: 'supervision', duration: 60000, requiresTarget: 'any_subordinate' },
        { displayName: 'Check Development Progress', requiredLocation: 'supervision', duration: 45000, requiresTarget: 'Lead Developer' },
        { displayName: 'Team Coordination', requiredLocation: 'meeting_room', duration: 75000 },
        { displayName: 'Budget Review', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Milestone Planning', requiredLocation: 'meeting_room', duration: 120000 },
        { displayName: 'Print Project Reports', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Strategic Coffee', requiredLocation: 'break_room', duration: 25000 }
    ],

    // CORPORATE ROLES
    'IT Specialist': [
        { displayName: 'System Maintenance', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Troubleshoot Issues', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Network Monitoring', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Security Updates', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'IT Team Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'User Support', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Print IT Reports', requiredLocation: 'printer', duration: 15000 },
        { displayName: 'Tech Break', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Admin Assistant': [
        { displayName: 'Schedule Management', requiredLocation: 'desk', duration: 60000 },
        { displayName: 'Email Correspondence', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Document Filing', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Meeting Preparation', requiredLocation: 'meeting_room', duration: 45000 },
        { displayName: 'Phone Calls', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Supply Ordering', requiredLocation: 'desk', duration: 50000 },
        { displayName: 'Print Documents', requiredLocation: 'printer', duration: 25000 },
        { displayName: 'Admin Break', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Business Analyst': [
        { displayName: 'Data Analysis', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Report Generation', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Stakeholder Meeting', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Requirements Gathering', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Process Mapping', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Presentation Prep', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Print Analysis', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Analysis Break', requiredLocation: 'break_room', duration: 25000 }
    ],
    'HR Manager': [
        { displayName: 'Employee Relations', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Supervise HR Team', requiredLocation: 'supervision', duration: 45000, requiresTarget: 'Admin Assistant' },
        { displayName: 'Policy Review', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Hiring Interviews', requiredLocation: 'meeting_room', duration: 75000 },
        { displayName: 'Performance Reviews', requiredLocation: 'meeting_room', duration: 100000 },
        { displayName: 'Training Coordination', requiredLocation: 'desk', duration: 80000 },
        { displayName: 'Print HR Documents', requiredLocation: 'printer', duration: 15000 },
        { displayName: 'HR Coffee Chat', requiredLocation: 'break_room', duration: 30000 }
    ],
    'Project Manager': [
        { displayName: 'Project Planning', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Team Supervision', requiredLocation: 'supervision', duration: 60000, requiresTarget: 'any_subordinate' },
        { displayName: 'Check Team Progress', requiredLocation: 'supervision', duration: 45000, requiresTarget: 'Business Analyst' },
        { displayName: 'Stakeholder Updates', requiredLocation: 'meeting_room', duration: 75000 },
        { displayName: 'Risk Assessment', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Resource Planning', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Print Project Plans', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Project Coffee', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Accountant': [
        { displayName: 'Financial Records', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Budget Analysis', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Tax Preparation', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Financial Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Audit Preparation', requiredLocation: 'desk', duration: 200000 },
        { displayName: 'Expense Reports', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Print Financial Reports', requiredLocation: 'printer', duration: 25000 },
        { displayName: 'Numbers Break', requiredLocation: 'break_room', duration: 20000 }
    ],

    // PR AGENCY ROLES
    'Account Manager': [
        { displayName: 'Client Relations', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Supervise Account Team', requiredLocation: 'supervision', duration: 50000, requiresTarget: 'Copywriter' },
        { displayName: 'Campaign Planning', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Client Calls', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Proposal Development', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Team Coordination', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Print Client Reports', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Client Coffee', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Creative Director': [
        { displayName: 'Creative Strategy', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Supervise Creative Team', requiredLocation: 'supervision', duration: 60000, requiresTarget: 'any_subordinate' },
        { displayName: 'Review Creative Work', requiredLocation: 'supervision', duration: 45000, requiresTarget: 'Copywriter' },
        { displayName: 'Creative Brainstorming', requiredLocation: 'meeting_room', duration: 120000 },
        { displayName: 'Concept Development', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Client Presentations', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Print Creative Briefs', requiredLocation: 'printer', duration: 15000 },
        { displayName: 'Creative Inspiration', requiredLocation: 'break_room', duration: 30000 }
    ],
    'Social Media Manager': [
        { displayName: 'Content Scheduling', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Social Media Monitoring', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Community Management', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Analytics Review', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Strategy Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Content Creation', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Print Social Reports', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Trend Watching', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Copywriter': [
        { displayName: 'Ad Copy Writing', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Content Research', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Brand Voice Development', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Copy Review Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Website Copy', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Email Campaigns', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Print Copy Drafts', requiredLocation: 'printer', duration: 15000 },
        { displayName: 'Writer\'s Break', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Media Planner': [
        { displayName: 'Media Strategy', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Budget Planning', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Vendor Negotiations', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Media Review Meeting', requiredLocation: 'meeting_room', duration: 75000 },
        { displayName: 'Campaign Analysis', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Performance Tracking', requiredLocation: 'desk', duration: 80000 },
        { displayName: 'Print Media Plans', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Media Break', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Brand Strategist': [
        { displayName: 'Brand Analysis', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Market Research', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Strategy Development', requiredLocation: 'desk', duration: 200000 },
        { displayName: 'Brand Workshop', requiredLocation: 'meeting_room', duration: 120000 },
        { displayName: 'Competitive Analysis', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Brand Guidelines', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Print Strategy Docs', requiredLocation: 'printer', duration: 25000 },
        { displayName: 'Strategic Thinking', requiredLocation: 'break_room', duration: 30000 }
    ],

    // NEWSPAPER ROLES
    'Reporter': [
        { displayName: 'Story Research', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Interview Calls', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Article Writing', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Editorial Meeting', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Fact Checking', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Source Verification', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Print Story Drafts', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Reporter\'s Break', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Editor': [
        { displayName: 'Article Review', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Supervise Reporters', requiredLocation: 'supervision', duration: 45000, requiresTarget: 'Reporter' },
        { displayName: 'Check Story Progress', requiredLocation: 'supervision', duration: 30000, requiresTarget: 'Reporter' },
        { displayName: 'Editorial Planning', requiredLocation: 'meeting_room', duration: 90000 },
        { displayName: 'Content Editing', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Deadline Management', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Print Final Drafts', requiredLocation: 'printer', duration: 25000 },
        { displayName: 'Editorial Coffee', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Photographer': [
        { displayName: 'Photo Editing', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Equipment Maintenance', requiredLocation: 'desk', duration: 60000 },
        { displayName: 'Photo Selection', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Assignment Planning', requiredLocation: 'meeting_room', duration: 45000 },
        { displayName: 'Digital Processing', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Archive Organization', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Print Contact Sheets', requiredLocation: 'printer', duration: 30000 },
        { displayName: 'Creative Break', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Layout Designer': [
        { displayName: 'Page Layout', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Typography Work', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Image Placement', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Design Review', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Print Production', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Design Standards', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Print Layout Proofs', requiredLocation: 'printer', duration: 40000 },
        { displayName: 'Design Inspiration', requiredLocation: 'break_room', duration: 25000 }
    ],
    'Copy Editor': [
        { displayName: 'Proofreading', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Grammar Checking', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Style Guide Review', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Editor Coordination', requiredLocation: 'meeting_room', duration: 45000 },
        { displayName: 'Fact Verification', requiredLocation: 'desk', duration: 150000 },
        { displayName: 'Final Review', requiredLocation: 'desk', duration: 80000 },
        { displayName: 'Print Corrections', requiredLocation: 'printer', duration: 20000 },
        { displayName: 'Editor\'s Break', requiredLocation: 'break_room', duration: 20000 }
    ],
    'Columnist': [
        { displayName: 'Column Writing', requiredLocation: 'desk', duration: 180000 },
        { displayName: 'Opinion Research', requiredLocation: 'desk', duration: 120000 },
        { displayName: 'Topic Brainstorming', requiredLocation: 'desk', duration: 90000 },
        { displayName: 'Reader Engagement', requiredLocation: 'desk', duration: 75000 },
        { displayName: 'Editorial Discussion', requiredLocation: 'meeting_room', duration: 60000 },
        { displayName: 'Content Planning', requiredLocation: 'desk', duration: 100000 },
        { displayName: 'Print Column Drafts', requiredLocation: 'printer', duration: 15000 },
        { displayName: 'Inspiration Time', requiredLocation: 'break_room', duration: 30000 }
    ]
};

/**
 * Get tasks for a specific job role
 * @param {string} jobRole - The job role to get tasks for
 * @returns {Array} Array of task objects for the job role
 */
export function getTasksForRole(jobRole) {
    return TASK_DICTIONARY[jobRole] || [];
}

/**
 * Get all available job roles
 * @returns {Array} Array of job role strings
 */
export function getAllJobRoles() {
    return Object.keys(TASK_DICTIONARY);
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
    const requiredFields = ['displayName', 'requiredLocation', 'duration'];
    const validLocations = ['desk', 'meeting_room', 'break_room', 'printer'];
    
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
            
            // Validate location
            if (task.requiredLocation && !validLocations.includes(task.requiredLocation)) {
                errors.push(`${jobRole}[${index}]: invalid location '${task.requiredLocation}'`);
            }
            
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

console.log('📋 Task Dictionary module loaded');
