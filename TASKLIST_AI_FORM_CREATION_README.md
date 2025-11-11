# Tasklist-Based AI Form Creation - Alternative Approach

## Overview

This is an alternative approach to AI-powered form creation that uses the GOV.UK Design System's tasklist pattern. Unlike the step-by-step approach, this method allows users to work on tasks in any order and provides a more flexible, task-oriented experience.

## Key Differences from Step-by-Step Approach

### Tasklist Approach

- **Flexible Order**: Users can complete tasks in any order they prefer
- **Task-Oriented**: Each task is a separate page with focused content
- **Progress Tracking**: Visual tasklist shows completion status
- **Save & Return**: Users can save progress and return to task list
- **Non-Linear**: No forced sequential progression

### Step-by-Step Approach

- **Sequential Order**: Users must complete sections in order
- **Section-Oriented**: All sections on one page with navigation
- **Real-Time Preview**: Live preview of assembled prompt
- **Linear Flow**: Forced progression through sections

## Features

### Core Functionality

1. **Tasklist Interface**: Uses GOV.UK Design System's `govukTaskList` component
2. **Individual Task Pages**: Each task has its own dedicated page
3. **Flexible Navigation**: Users can jump between tasks freely
4. **Progress Tracking**: Visual indicators show task completion status
5. **Save & Continue**: Progress is saved automatically
6. **Review & Submit**: Final review page before submission

### Task Structure

The same 6 tasks as the step-by-step approach:

1. **Upload wireframe or mockup** - Image or PDF of layout (optional)
2. **Provide question protocol** - UXMatters Question Protocol document (required)
3. **Add reference links** - URLs to design specs, APIs, or research (optional)
4. **Describe form pages** - Plain-text walkthrough of every form page (required)
5. **Define form aim** - One-sentence statement of purpose and success criteria (required)
6. **Specify conditional logic** - Outline of any branching or show/hide rules (optional)

### Task Status Indicators

- **Not started** (grey tag) - Task hasn't been attempted
- **In progress** (blue tag) - Task has been started but not completed
- **Completed** (green text) - Task is fully completed

## Technical Implementation

### Files Created

- `app/views/titan-mvp-1.2/ai/tasklist-form-creation.html` - Main tasklist interface
- `app/views/titan-mvp-1.2/ai/task/question-protocol.html` - Question protocol task page
- `app/views/titan-mvp-1.2/ai/task/review.html` - Review and submit page
- `app/routes/titan-mvp-1.2/routes.js` - Added tasklist route handlers

### Route Structure

- **Main Tasklist**: `/titan-mvp-1.2/ai/tasklist-form-creation`
- **Individual Tasks**: `/titan-mvp-1.2/ai/task/{task-name}`
- **Review**: `/titan-mvp-1.2/ai/task/review`

### Key Features

#### Frontend

- **GOV.UK Tasklist Component**: Native Design System component
- **Task Status Logic**: Dynamic status calculation based on session data
- **Flexible Navigation**: Links to any task from any page
- **Progress Calculation**: Automatic completion counting

#### Backend

- **Session Management**: Stores task data in user session
- **Task-Specific Routes**: Individual handlers for each task
- **Prompt Assembly**: Automatic concatenation in review page
- **Status Tracking**: Tracks started vs completed states

## User Experience

### Workflow

1. **Start**: User visits tasklist page
2. **Choose Task**: User clicks on any task they want to work on
3. **Complete Task**: User fills out the task form
4. **Save**: User saves and returns to tasklist or continues to another task
5. **Repeat**: User works on tasks in any order
6. **Review**: User reviews assembled prompt when ready
7. **Submit**: User submits to AI system

### Advantages

- **User Control**: Users choose their own workflow
- **Flexibility**: Can work on tasks in any order
- **Progress Visibility**: Clear view of what's been completed
- **Save & Return**: Can save progress and return later
- **Familiar Pattern**: Uses standard GOV.UK tasklist pattern

### Use Cases

This approach is particularly suitable for:

- **Complex Forms**: When users need time to think about each aspect
- **Collaborative Work**: When multiple people might work on different tasks
- **Iterative Development**: When users want to refine tasks over time
- **Non-Linear Thinking**: When users prefer to work on what they know first

## Comparison with Step-by-Step Approach

| Feature             | Tasklist Approach   | Step-by-Step Approach |
| ------------------- | ------------------- | --------------------- |
| Navigation          | Flexible, any order | Sequential only       |
| User Control        | High                | Medium                |
| Progress Visibility | Tasklist overview   | Progress bar          |
| Real-time Preview   | No                  | Yes                   |
| Save & Return       | Yes                 | No                    |
| Complexity          | Lower               | Higher                |
| Learning Curve      | Familiar pattern    | New pattern           |

## Future Enhancements

### Potential Improvements

1. **Task Dependencies**: Some tasks could be dependent on others
2. **Task Templates**: Pre-filled templates for common scenarios
3. **Collaboration**: Multi-user task completion
4. **Task Validation**: More sophisticated validation rules
5. **Task History**: Track changes to tasks over time
6. **Export Tasks**: Download individual task data

### Technical Enhancements

1. **Database Storage**: Persistent task storage
2. **Task API**: RESTful API for task management
3. **Real-time Updates**: Live task status updates
4. **Task Analytics**: Track task completion patterns
5. **Performance**: Optimize for large numbers of tasks

## Testing Considerations

### Manual Testing Checklist

- [ ] All tasks can be accessed from tasklist
- [ ] Task status updates correctly after completion
- [ ] Progress calculation works accurately
- [ ] Save and return functionality works
- [ ] Review page assembles prompt correctly
- [ ] Navigation between tasks works smoothly
- [ ] Tasklist shows correct status indicators
- [ ] Form validation works on task pages

### Accessibility

- [ ] Tasklist follows GOV.UK accessibility guidelines
- [ ] Keyboard navigation works for all tasks
- [ ] Screen reader compatibility
- [ ] Color contrast meets standards
- [ ] Focus management works correctly

## Notes

This tasklist approach provides an alternative to the step-by-step method, offering more flexibility and user control. It's particularly well-suited for users who prefer to work on tasks in their own order or who need to save progress and return later.

The implementation uses the standard GOV.UK Design System tasklist component, making it familiar to users and ensuring consistency with other government services.
