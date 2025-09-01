
#!/bin/bash

# Ultimate Crypto Trading Platform - Complete Test Suite
# Run all tests: unit, integration, E2E, security, performance

set -e

echo "🧪 Starting Comprehensive Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
UNIT_TESTS_PASSED=false
INTEGRATION_TESTS_PASSED=false
E2E_TESTS_PASSED=false
SECURITY_TESTS_PASSED=false
PERFORMANCE_TESTS_PASSED=false

print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1 PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 FAILED${NC}"
        return 1
    fi
}

# 1. Unit Tests
echo -e "\n${BLUE}🔬 Running Unit Tests...${NC}"
npm run test:unit 2>&1 | tee logs/unit-tests.log
if print_status "Unit Tests" $?; then
    UNIT_TESTS_PASSED=true
fi

# 2. Integration Tests
echo -e "\n${BLUE}🔗 Running Integration Tests...${NC}"
npm run test:integration 2>&1 | tee logs/integration-tests.log
if print_status "Integration Tests" $?; then
    INTEGRATION_TESTS_PASSED=true
fi

# 3. E2E Tests
echo -e "\n${BLUE}🎭 Running E2E Tests...${NC}"
npm run test:e2e 2>&1 | tee logs/e2e-tests.log
if print_status "E2E Tests" $?; then
    E2E_TESTS_PASSED=true
fi

# 4. Security Tests
echo -e "\n${BLUE}🔐 Running Security Tests...${NC}"
npm run test:security 2>&1 | tee logs/security-tests.log
if print_status "Security Tests" $?; then
    SECURITY_TESTS_PASSED=true
fi

# 5. Performance Tests
echo -e "\n${BLUE}⚡ Running Performance Tests...${NC}"
npm run test:performance 2>&1 | tee logs/performance-tests.log
if print_status "Performance Tests" $?; then
    PERFORMANCE_TESTS_PASSED=true
fi

# 6. Code Coverage
echo -e "\n${BLUE}📊 Generating Code Coverage Report...${NC}"
npm run test:coverage 2>&1 | tee logs/coverage.log

# 7. Audit Tests
echo -e "\n${BLUE}🔍 Running System Audit...${NC}"
npm run audit:comprehensive 2>&1 | tee logs/audit.log

# Generate Test Report
echo -e "\n${YELLOW}📋 Generating Test Report...${NC}"

cat > test-report.md << EOF
# Test Suite Report - $(date)

## Summary
- Unit Tests: $([ "$UNIT_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")
- Integration Tests: $([ "$INTEGRATION_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")  
- E2E Tests: $([ "$E2E_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")
- Security Tests: $([ "$SECURITY_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")
- Performance Tests: $([ "$PERFORMANCE_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")

## Detailed Logs
- Unit Tests: \`logs/unit-tests.log\`
- Integration Tests: \`logs/integration-tests.log\`
- E2E Tests: \`logs/e2e-tests.log\`  
- Security Tests: \`logs/security-tests.log\`
- Performance Tests: \`logs/performance-tests.log\`
- Coverage Report: \`logs/coverage.log\`
- System Audit: \`logs/audit.log\`

## Next Steps
$([ "$UNIT_TESTS_PASSED" = false ] && echo "- Fix failing unit tests")
$([ "$INTEGRATION_TESTS_PASSED" = false ] && echo "- Fix integration issues")
$([ "$E2E_TESTS_PASSED" = false ] && echo "- Fix E2E test failures")
$([ "$SECURITY_TESTS_PASSED" = false ] && echo "- Address security vulnerabilities")  
$([ "$PERFORMANCE_TESTS_PASSED" = false ] && echo "- Optimize performance bottlenecks")
EOF

echo -e "\n${GREEN}📋 Test report saved to: test-report.md${NC}"

# Final Status
ALL_PASSED=true
[ "$UNIT_TESTS_PASSED" = false ] && ALL_PASSED=false
[ "$INTEGRATION_TESTS_PASSED" = false ] && ALL_PASSED=false
[ "$E2E_TESTS_PASSED" = false ] && ALL_PASSED=false
[ "$SECURITY_TESTS_PASSED" = false ] && ALL_PASSED=false
[ "$PERFORMANCE_TESTS_PASSED" = false ] && ALL_PASSED=false

if [ "$ALL_PASSED" = true ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! System is ready for deployment.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Check logs and fix issues before deployment.${NC}"
    exit 1
fi
