import reportsData from '@/services/mockData/reports.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const reportService = {
  async getReportData() {
    await delay(400);
    return { ...reportsData };
  },

async generateReport(type, params) {
    await delay(500);
    return {
      success: true,
      reportId: Math.random().toString(36).substr(2, 9),
      downloadUrl: `/api/reports/download/${type}`,
      generatedAt: new Date().toISOString()
    };
  },

  async generateContractorSummary() {
    await delay(800);
    
    // Import contractor data
    const { contractorService } = await import('./contractorService');
    const contractors = await contractorService.getAll();
    
    // Calculate summary statistics
    const totalContractors = contractors.length;
    const activeContractors = contractors.filter(c => c.status === 'active').length;
    const totalMonthlyCost = contractors
      .filter(c => c.status === 'active' && c.monthlyCost)
      .reduce((sum, c) => sum + (c.monthlyCost || 0), 0);
    
    // Department breakdown
    const departmentMap = new Map();
    contractors.forEach(contractor => {
      const dept = contractor.department;
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          department: dept,
          activeCount: 0,
          inactiveCount: 0,
          totalRate: 0,
          rateCount: 0,
          monthlyCost: 0
        });
      }
      
      const deptData = departmentMap.get(dept);
      if (contractor.status === 'active') {
        deptData.activeCount++;
        deptData.monthlyCost += (contractor.monthlyCost || 0);
      } else {
        deptData.inactiveCount++;
      }
      
      if (contractor.hourlyRate) {
        deptData.totalRate += contractor.hourlyRate;
        deptData.rateCount++;
      }
    });
    
    const departmentBreakdown = Array.from(departmentMap.values()).map(dept => ({
      ...dept,
      averageRate: dept.rateCount > 0 ? Math.round(dept.totalRate / dept.rateCount) : 0
    }));
    
    // Status distribution
    const statusMap = new Map();
    contractors.forEach(contractor => {
      const status = contractor.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: Math.round((count / totalContractors) * 100)
    }));
    
    // Contract duration analysis
    const today = new Date();
    let endingIn30Days = 0;
    let endingIn60Days = 0;
    let longTerm = 0;
    
    contractors.filter(c => c.status === 'active').forEach(contractor => {
      const daysRemaining = contractor.daysRemaining || 0;
      if (daysRemaining <= 30) {
        endingIn30Days++;
      } else if (daysRemaining <= 60) {
        endingIn60Days++;
      } else {
        longTerm++;
      }
    });
    
    return {
      reportId: Math.random().toString(36).substr(2, 9),
      reportType: 'contractor-summary',
      generatedAt: new Date().toISOString(),
      summary: {
        totalContractors,
        activeContractors,
        activeDepartments: departmentBreakdown.filter(d => d.activeCount > 0).length,
        totalMonthlyCost
      },
      departmentBreakdown: departmentBreakdown.sort((a, b) => b.activeCount - a.activeCount),
      statusDistribution: statusDistribution.sort((a, b) => b.count - a.count),
      contractAnalysis: {
        endingIn30Days,
        endingIn60Days,
        longTerm
      }
    };
  }
};