/**
 * TASK DICTIONARY - Centralized task definitions for all job roles
 * 
 * Each task object structure:
 * - displayName: Human-readable task name
 * - requiredLocation: Where the task must be performed ('desk', 'meeting_room', 'break_room', 'printer')
 * - duration: Time in milliseconds to complete the task
 */

export const TASK_DICTIONARY = {
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
