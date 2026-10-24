const app = require('../src/app');
const { pool } = require('../src/config/db');
const http = require('http');

let server;
let baseUrl;

// Simple test runner
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  return {
    status: response.status,
    headers: response.headers,
    data,
  };
}

async function run() {
  console.log('\n--- STARTING TEAMUP BACKEND TEST SUITE ---\n');

  // Start ephemeral test server on random port
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Ephemeral test server running at ${baseUrl}`);
      resolve();
    });
  });

  try {
    // 1. Health check
    console.log('\nTesting Health Endpoint:');
    const health = await request('/api/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK');
    assert(health.data.data.database === 'connected', 'Database status reports connected');

    // 2. Authentication: Registration
    console.log('\nTesting Authentication Scenarios:');
    const testEmail = `test.student.${Date.now()}@test.edu`;
    
    // Invalid email rejection
    const invalidEmailRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Student',
        email: 'invalid-email-format',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'BUET',
        department: 'CSE',
      },
    });
    assert(invalidEmailRes.status === 422, 'Rejects invalid email format with 422');

    // Password mismatch rejection
    const mismatchRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Student',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
        university: 'BUET',
        department: 'CSE',
      },
    });
    assert(mismatchRes.status === 422, 'Rejects password confirmation mismatch with 422');

    // Valid registration
    const registerRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Student One',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'BUET',
        department: 'CSE',
      },
    });
    assert(registerRes.status === 201, 'Successful registration returns 201');
    assert(registerRes.data.data.user.email === testEmail, 'User email returned correctly in response');
    assert(!registerRes.data.data.user.password_hash, 'Password hash is NEVER returned in response');
    const userOneToken = registerRes.data.data.token;
    const userOneId = registerRes.data.data.user.id;

    // Duplicate email registration
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Student',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'BUET',
        department: 'CSE',
      },
    });
    assert(dupRes.status === 409, 'Rejects duplicate email with 409 conflict');

    // Login with invalid credentials
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'WrongPassword!',
      },
    });
    assert(badLogin.status === 401, 'Rejects wrong password with 401');

    // Login with valid credentials
    const goodLogin = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'Password123!',
      },
    });
    assert(goodLogin.status === 200, 'Successful login returns 200 OK');
    assert(goodLogin.data.data.token, 'Login returns JWT token');

    // Access protected route without token
    const unauthMe = await request('/api/auth/me');
    assert(unauthMe.status === 401, 'Protected route /api/auth/me rejects unauthenticated request with 401');

    // Access protected route with Bearer token
    const authMe = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${userOneToken}` },
    });
    assert(authMe.status === 200, 'Protected route /api/auth/me allows valid token');

    // Register second student for interaction tests
    const studentTwoEmail = `student.two.${Date.now()}@test.edu`;
    const regTwo = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Student Two',
        email: studentTwoEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'Dhaka University',
        department: 'Physics',
      },
    });
    const userTwoToken = regTwo.data.data.token;
    const userTwoId = regTwo.data.data.user.id;

    // 3. Profiles and Skills
    console.log('\nTesting Profile and Skills Management:');
    const updateProfileRes = await request('/api/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userOneToken}` },
      body: {
        bio: 'Updated bio for student one',
        github_url: 'https://github.com/student-one',
        portfolio_url: 'https://studentone.dev',
      },
    });
    assert(updateProfileRes.status === 200, 'User can update their bio and URLs');
    assert(updateProfileRes.data.data.profile.bio === 'Updated bio for student one', 'Bio successfully updated');

    // Update skills
    const updateSkillsRes = await request('/api/users/me/skills', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userOneToken}` },
      body: {
        skills: [
          { name: 'React', proficiency_level: 'advanced' },
          { name: 'TypeScript', proficiency_level: 'intermediate' },
        ],
      },
    });
    assert(updateSkillsRes.status === 200, 'User can update skills');
    assert(updateSkillsRes.data.data.profile.skills.length === 2, 'Skills count matches 2');

    // 4. Projects: Creation, Discovery, Modification
    console.log('\nTesting Project Operations:');
    const createProjectRes = await request('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userOneToken}` },
      body: {
        title: 'Quantum Simulator Web App',
        summary: 'A web based simulator for quantum computing logic gates and circuits.',
        description: 'Detailed description about our quantum gate visualizer using React and WebAssembly. Looking for students interested in math and algorithms.',
        category: 'Web Development',
        desired_team_size: 2, // owner + 1 member max
        collaboration_type: 'academic',
        skills: ['React', 'JavaScript', 'Algorithms'],
      },
    });
    assert(createProjectRes.status === 201, 'User can create a new project');
    const createdProject = createProjectRes.data.data.project;
    const projectId = createdProject.id;
    assert(createdProject.owner_id === userOneId, 'Project owner ID matches creator');
    assert(createdProject.current_members === 1, 'Owner is counted as initial active member');
    assert(createdProject.available_capacity === 1, 'Available capacity correctly equals 1 (desired 2 - current 1)');

    // Unauthorized edit test: User Two attempts to edit User One's project
    const unauthEdit = await request(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userTwoToken}` },
      body: { title: 'Hacked Title' },
    });
    assert(unauthEdit.status === 403, 'Unauthorized user edit is rejected with 403 Forbidden');

    // Authorized edit test: User One edits their project
    const authEdit = await request(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userOneToken}` },
      body: { summary: 'Updated summary for quantum simulator with new gate support.' },
    });
    assert(authEdit.status === 200, 'Owner can edit their own project');

    // Search and filter projects
    const searchRes = await request('/api/projects?search=Quantum&category=Web+Development');
    assert(searchRes.status === 200, 'Projects search endpoint returns 200');
    assert(searchRes.data.data.projects.some((p) => p.id === projectId), 'Search finds newly created project');

    // 5. Join Requests and Capacity Rules
    console.log('\nTesting Join Requests & Business Rules:');

    // Rule: Owner cannot submit a join request to their own project
    const ownerSelfJoin = await request(`/api/projects/${projectId}/requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userOneToken}` },
      body: { message: 'I want to join my own project' },
    });
    assert(ownerSelfJoin.status === 400, 'Owner cannot submit join request to their own project');

    // Valid join request from User Two
    const validJoin = await request(`/api/projects/${projectId}/requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTwoToken}` },
      body: { message: 'I have quantum physics knowledge and would love to join!' },
    });
    assert(validJoin.status === 201, 'Non-owner student can submit join request');
    const requestId = validJoin.data.data.request.id;

    // Rule: Cannot submit duplicate pending join request
    const dupJoin = await request(`/api/projects/${projectId}/requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTwoToken}` },
      body: { message: 'Second duplicate request' },
    });
    assert(dupJoin.status === 409, 'Duplicate pending request is rejected with 409 Conflict');

    // Unauthorized status update: User Two cannot accept their own request
    const unauthAccept = await request(`/api/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userTwoToken}` },
      body: { status: 'accepted' },
    });
    assert(unauthAccept.status === 403, 'Non-owner cannot accept requests (403 Forbidden)');

    // Authorized status update: Project owner accepts User Two's request
    const authAccept = await request(`/api/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userOneToken}` },
      body: { status: 'accepted' },
    });
    assert(authAccept.status === 200, 'Owner successfully accepts join request');

    // Check capacity after acceptance: desired_team_size was 2 (Owner + User Two = 2, team is FULL)
    const projectDetailsAfter = await request(`/api/projects/${projectId}`);
    assert(projectDetailsAfter.data.data.project.current_members === 2, 'Team now has 2 members');
    assert(projectDetailsAfter.data.data.project.available_capacity === 0, 'Available capacity is 0 (full)');

    // Rule: Cannot submit join request when project team is full
    // Create third user to test join request rejection on full project
    const studentThreeEmail = `student.three.${Date.now()}@test.edu`;
    const regThree = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Student Three',
        email: studentThreeEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'IUT',
        department: 'SWE',
      },
    });
    const userThreeToken = regThree.data.data.token;

    const fullProjectJoin = await request(`/api/projects/${projectId}/requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userThreeToken}` },
      body: { message: 'Can I join please?' },
    });
    assert(fullProjectJoin.status === 400, 'Cannot join project when maximum team capacity is reached');

    // 6. Notifications
    console.log('\nTesting Notifications:');
    const userTwoNotifs = await request('/api/notifications', {
      headers: { Authorization: `Bearer ${userTwoToken}` },
    });
    assert(userTwoNotifs.status === 200, 'Notifications endpoint returns 200');
    assert(
      userTwoNotifs.data.data.notifications.some((n) => n.type === 'join_request_accepted'),
      'Accepted user receives "join_request_accepted" notification'
    );

    // 7. Bookmarks / Watchlist
    console.log('\nTesting Project Bookmarks:');
    const addBookmark = await request(`/api/projects/${projectId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTwoToken}` },
    });
    assert(addBookmark.status === 200, 'User can toggle bookmark on project');
    assert(addBookmark.data.data.is_bookmarked === true, 'Project is marked as bookmarked');

    const getBookmarks = await request('/api/bookmarks', {
      headers: { Authorization: `Bearer ${userTwoToken}` },
    });
    assert(getBookmarks.status === 200, 'User can fetch bookmarked projects list');
    assert(
      getBookmarks.data.data.projects.some((p) => p.id === projectId),
      'Bookmarked project is present in user bookmarks'
    );

    const removeBookmark = await request(`/api/projects/${projectId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTwoToken}` },
    });
    assert(removeBookmark.data.data.is_bookmarked === false, 'Toggling bookmark again un-bookmarks project');

    // 8. Project Discussions & Q&A
    console.log('\nTesting Discussions & Q&A:');
    const postQuestion = await request(`/api/projects/${projectId}/discussions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userThreeToken}` },
      body: { content: 'Is prior experience with Docker required?', type: 'public_qa' },
    });
    assert(postQuestion.status === 201, 'Student can post public Q&A question');

    const getQA = await request(`/api/projects/${projectId}/discussions?type=public_qa`);
    assert(getQA.status === 200, 'Anyone can fetch public Q&A discussions');
    assert(getQA.data.data.discussions.length >= 1, 'Q&A discussions contains the posted question');

    // Team internal discussion test (userTwo is accepted team member, userThree is not)
    const postTeamMsg = await request(`/api/projects/${projectId}/discussions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTwoToken}` },
      body: { content: 'Here is our team shared repo link', type: 'team_internal' },
    });
    assert(postTeamMsg.status === 201, 'Accepted team member can post to internal team discussion');

    const nonMemberViewInternal = await request(`/api/projects/${projectId}/discussions?type=team_internal`, {
      headers: { Authorization: `Bearer ${userThreeToken}` },
    });
    assert(nonMemberViewInternal.status === 403, 'Non-team member is forbidden from reading internal discussion');

    // 9. Tasks & Kanban Board
    console.log('\nTesting Team Tasks & Milestones:');
    const createTaskRes = await request(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userOneToken}` },
      body: {
        title: 'Setup Initial CI/CD Pipeline',
        description: 'Configure GitHub Actions for automated test runs',
        priority: 'high',
      },
    });
    assert(createTaskRes.status === 201, 'Owner can create project task');
    const createdTaskId = createTaskRes.data.data.task.id;
    assert(createTaskRes.data.data.task.status === 'todo', 'New task defaults to "todo" status');

    const updateTaskRes = await request(`/api/tasks/${createdTaskId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userTwoToken}` },
      body: { status: 'in_progress' },
    });
    assert(updateTaskRes.status === 200, 'Team member can update task status to "in_progress"');
    assert(updateTaskRes.data.data.task.status === 'in_progress', 'Task status is updated in database');

    const nonMemberUpdateTask = await request(`/api/tasks/${createdTaskId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userThreeToken}` },
      body: { status: 'completed' },
    });
    assert(nonMemberUpdateTask.status === 403, 'Non-team member cannot update task');

    const getTasksRes = await request(`/api/projects/${projectId}/tasks`);
    assert(getTasksRes.status === 200, 'Tasks endpoint returns 200');
    assert(getTasksRes.data.data.tasks.length >= 1, 'Tasks array contains created task');

    // 10. Clean up test project
    console.log('\nTesting Project Deletion:');
    const deleteRes = await request(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userOneToken}` },
    });
    assert(deleteRes.status === 200, 'Owner can delete project successfully');

    // Verify project no longer exists
    const getDeleted = await request(`/api/projects/${projectId}`);
    assert(getDeleted.status === 404, 'Deleted project returns 404 Not Found');

    console.log('\n--- TEST SUITE COMPLETE ---');
    console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test suite:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
  }
}

run();

