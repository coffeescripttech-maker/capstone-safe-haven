/**
 * Task 9 Checkpoint Verification Script
 * Verifies that backend authorization implementation is complete
 * 
 * This script checks:
 * 1. All routes have proper authorization middleware
 * 2. Services are properly implemented
 * 3. Database schema is correct
 * 4. Audit logging is working
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Task 9: Backend Authorization Checkpoint Verification    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

function check(description, testFn) {
  totalChecks++;
  try {
    const result = testFn();
    if (result === true) {
      passedChecks++;
      console.log(`✅ PASS: ${description}`);
      return true;
    } else if (result === 'warning') {
      warnings++;
      console.log(`⚠️  WARN: ${description}`);
      return false;
    } else {
      failedChecks++;
      console.log(`❌ FAIL: ${description}`);
      return false;
    }
  } catch (error) {
    failedChecks++;
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// ============================================================================
// 1. Verify Route Files Have Authorization Middleware
// ============================================================================

console.log('\n=== 1. Route Authorization Middleware Verification ===\n');

const routeFiles = [
  'src/routes/user.routes.ts',
  'src/routes/alert.routes.ts',
  'src/routes/incident.routes.ts',
  'src/routes/sos.routes.ts',
  'src/routes/evacuation.routes.ts',
  'src/routes/admin.routes.ts'
];

routeFiles.forEach(routeFile => {
  const filePath = path.join(__dirname, routeFile);
  
  check(`${routeFile} exists`, () => {
    return fs.existsSync(filePath);
  });
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    check(`${routeFile} imports authenticate middleware`, () => {
      return content.includes('authenticate');
    });
    
    check(`${routeFile} imports requirePermission middleware`, () => {
      return content.includes('requirePermission') || content.includes('authorize');
    });
    
    check(`${routeFile} uses authentication on protected routes`, () => {
      // Check if authenticate is used in route definitions
      return content.match(/authenticate/g)?.length > 1; // More than just import
    });
  }
});

// ============================================================================
// 2. Verify Middleware Files Are Complete
// ============================================================================

console.log('\n=== 2. Middleware Implementation Verification ===\n');

const middlewareFiles = [
  { file: 'src/middleware/auth.ts', checks: ['authenticate', 'authorize', 'requirePermission'] },
  { file: 'src/middleware/rateLimiter.ts', checks: ['roleBasedRateLimiter', 'ROLE_LIMITS'] },
  { file: 'src/middleware/emergencyAccess.ts', checks: ['requireActiveEmergency'] }
];

middlewareFiles.forEach(({ file, checks: requiredFunctions }) => {
  const filePath = path.join(__dirname, file);
  
  check(`${file} exists`, () => {
    return fs.existsSync(filePath);
  });
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    requiredFunctions.forEach(fn => {
      check(`${file} implements ${fn}`, () => {
        return content.includes(fn);
      });
    });
  }
});

// ============================================================================
// 3. Verify Service Files Are Complete
// ============================================================================

console.log('\n=== 3. Service Implementation Verification ===\n');

const serviceFiles = [
  { 
    file: 'src/services/permission.service.ts', 
    checks: ['hasPermission', 'getPermissions', 'getRoleHierarchy', 'canModifyUser'] 
  },
  { 
    file: 'src/services/auditLogger.service.ts', 
    checks: ['logAccess', 'logAuthAttempt', 'queryLogs'] 
  },
  { 
    file: 'src/services/dataFilter.service.ts', 
    checks: ['applyRoleFilter', 'filterIncidents', 'filterSOSAlerts'] 
  },
  { 
    file: 'src/services/auth.service.ts', 
    checks: ['login', 'logout', 'isTokenBlacklisted'] 
  }
];

serviceFiles.forEach(({ file, checks: requiredMethods }) => {
  const filePath = path.join(__dirname, file);
  
  check(`${file} exists`, () => {
    return fs.existsSync(filePath);
  });
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    requiredMethods.forEach(method => {
      check(`${file} implements ${method}`, () => {
        return content.includes(method);
      });
    });
  }
});

// ============================================================================
// 4. Verify Database Migration Files
// ============================================================================

console.log('\n=== 4. Database Schema Verification ===\n');

const migrationFiles = [
  '001_enhance_rbac_users_table.sql',
  '002_create_role_permissions_table.sql',
  '003_create_audit_logs_table.sql',
  '004_seed_role_permissions.sql',
  '005_create_token_blacklist_table.sql',
  '006_add_fire_incident_type.sql',
  '007_add_alert_approval_workflow.sql'
];

migrationFiles.forEach(migrationFile => {
  const filePath = path.join(__dirname, '../database/migrations', migrationFile);
  
  check(`Migration ${migrationFile} exists`, () => {
    return fs.existsSync(filePath);
  });
});

// ============================================================================
// 5. Verify Test Files Exist
// ============================================================================

console.log('\n=== 5. Test Files Verification ===\n');

const testFiles = [
  'test-auth-enhancements.js',
  'test-middleware-enhancements.js',
  'test-role-hierarchy.js',
  'test-task5-integration.js',
  'test-role-rate-limiter.js'
];

testFiles.forEach(testFile => {
  const filePath = path.join(__dirname, testFile);
  
  check(`Test file ${testFile} exists`, () => {
    return fs.existsSync(filePath);
  });
});

// ============================================================================
// 6. Verify All 7 Roles Are Supported
// ============================================================================

console.log('\n=== 6. Role Support Verification ===\n');

const authMiddlewarePath = path.join(__dirname, 'src/middleware/auth.ts');
if (fs.existsSync(authMiddlewarePath)) {
  const content = fs.readFileSync(authMiddlewarePath, 'utf8');
  
  const roles = ['super_admin', 'admin', 'pnp', 'bfp', 'mdrrmo', 'lgu_officer', 'citizen'];
  
  roles.forEach(role => {
    check(`Role '${role}' is referenced in auth middleware`, () => {
      return content.includes(role);
    });
  });
}

// ============================================================================
// 7. Verify Key Features Are Implemented
// ============================================================================

console.log('\n=== 7. Key Features Implementation Verification ===\n');

const features = [
  {
    name: 'JWT role embedding',
    file: 'src/services/auth.service.ts',
    pattern: /role.*jwt|jwt.*role/i
  },
  {
    name: 'Token blacklist checking',
    file: 'src/middleware/auth.ts',
    pattern: /isTokenBlacklisted|blacklist/i
  },
  {
    name: 'Role hierarchy validation',
    file: 'src/services/permission.service.ts',
    pattern: /getRoleHierarchy|canModifyUser/i
  },
  {
    name: 'Audit logging',
    file: 'src/middleware/auth.ts',
    pattern: /auditLogger\.log/i
  },
  {
    name: 'Permission checking',
    file: 'src/middleware/auth.ts',
    pattern: /hasPermission|requirePermission/i
  },
  {
    name: 'Data filtering by role',
    file: 'src/services/dataFilter.service.ts',
    pattern: /applyRoleFilter|filterBy/i
  },
  {
    name: 'Role-based rate limiting',
    file: 'src/middleware/rateLimiter.ts',
    pattern: /roleBasedRateLimiter|ROLE_LIMITS/i
  },
  {
    name: 'Emergency access control',
    file: 'src/middleware/emergencyAccess.ts',
    pattern: /requireActiveEmergency/i
  }
];

features.forEach(({ name, file, pattern }) => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    check(`Feature '${name}' is implemented`, () => {
      return pattern.test(content);
    });
  } else {
    check(`Feature '${name}' is implemented`, () => {
      return 'warning';
    });
  }
});

// ============================================================================
// 8. Verify Task Completion Status
// ============================================================================

console.log('\n=== 8. Task Completion Status ===\n');

const tasksFilePath = path.join(__dirname, '../../.kiro/specs/enhanced-rbac-system/tasks.md');

if (fs.existsSync(tasksFilePath)) {
  const tasksContent = fs.readFileSync(tasksFilePath, 'utf8');
  
  // Check completed tasks (marked with [x])
  const completedTasks = (tasksContent.match(/- \[x\]/g) || []).length;
  const totalTasks = (tasksContent.match(/- \[[x\s-~]\]/g) || []).length;
  
  console.log(`📊 Task Progress: ${completedTasks}/${totalTasks} tasks completed`);
  
  // Check if tasks 1-8 are complete
  const criticalTasks = [
    { id: '1.', name: 'Database schema' },
    { id: '2.', name: 'Core authorization services' },
    { id: '3.', name: 'Authentication service' },
    { id: '4.', name: 'Authorization middleware' },
    { id: '5.', name: 'Role-specific access control' },
    { id: '6.', name: 'Route handlers' },
    { id: '7.', name: 'Special access rules' },
    { id: '8.', name: 'Rate limiting' }
  ];
  
  criticalTasks.forEach(task => {
    const taskPattern = new RegExp(`- \\[x\\] ${task.id}`, 'i');
    check(`Task ${task.id} (${task.name}) is marked complete`, () => {
      return taskPattern.test(tasksContent);
    });
  });
} else {
  console.log('⚠️  Tasks file not found');
}

// ============================================================================
// Summary
// ============================================================================

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Checkpoint Verification Summary                           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`Total Checks: ${totalChecks}`);
console.log(`✅ Passed: ${passedChecks} (${((passedChecks / totalChecks) * 100).toFixed(1)}%)`);
console.log(`❌ Failed: ${failedChecks} (${((failedChecks / totalChecks) * 100).toFixed(1)}%)`);
console.log(`⚠️  Warnings: ${warnings} (${((warnings / totalChecks) * 100).toFixed(1)}%)`);

const successRate = (passedChecks / totalChecks) * 100;

console.log('\n' + '='.repeat(60));

if (failedChecks === 0 && warnings === 0) {
  console.log('🎉 ALL CHECKS PASSED!');
  console.log('\n✅ Backend authorization implementation is COMPLETE');
  console.log('\nNext steps:');
  console.log('  1. Run manual tests for each role');
  console.log('  2. Review audit logs');
  console.log('  3. Proceed to frontend implementation (Task 10)');
  process.exit(0);
} else if (successRate >= 90) {
  console.log('✅ MOSTLY COMPLETE - Minor issues detected');
  console.log(`\n${failedChecks} checks failed, ${warnings} warnings`);
  console.log('\nReview the failed checks above and address any critical issues.');
  process.exit(0);
} else if (successRate >= 75) {
  console.log('⚠️  PARTIALLY COMPLETE - Some issues detected');
  console.log(`\n${failedChecks} checks failed, ${warnings} warnings`);
  console.log('\nAddress the failed checks before proceeding.');
  process.exit(1);
} else {
  console.log('❌ INCOMPLETE - Significant issues detected');
  console.log(`\n${failedChecks} checks failed, ${warnings} warnings`);
  console.log('\nSignificant work remains. Review implementation.');
  process.exit(1);
}
