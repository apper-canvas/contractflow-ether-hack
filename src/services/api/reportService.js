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
},

  async generateBudgetAnalysis() {
    await delay(800);
    
    // Import contractor and reports data
    const { contractorService } = await import('./contractorService');
    const contractors = await contractorService.getAll();
    const reportsData = await this.getReportData();
    
    // Base budget assumptions (in real app, this would come from a budget service)
    const totalBudget = 600000; // $600k monthly budget
    const departmentBudgets = {
      'Technology': 220000,
      'Risk Management': 95000,
      'Operations': 85000,
      'Finance': 75000,
      'Compliance': 65000,
      'Analytics': 60000
    };
    
    // Calculate actual spending from contractors
    const actualSpend = reportsData.monthlySpend;
    const variance = totalBudget - actualSpend;
    const variancePercentage = Math.round((variance / totalBudget) * 100);
    
    // Department budget analysis
    const departmentBreakdown = reportsData.departmentBreakdown.map(dept => {
      const budget = departmentBudgets[dept.department] || 50000;
      const actual = dept.spend;
      const deptVariance = budget - actual;
      const usagePercentage = Math.round((actual / budget) * 100);
      
      return {
        department: dept.department,
        budget,
        actual,
        variance: deptVariance,
        usagePercentage,
        contractors: dept.contractors
      };
    });
    
    // Generate budget alerts
    const budgetAlerts = [];
    departmentBreakdown.forEach(dept => {
      if (dept.usagePercentage > 100) {
        budgetAlerts.push({
          department: dept.department,
          severity: 'critical',
          message: `Over budget by ${dept.usagePercentage - 100}% ($${Math.abs(dept.variance).toLocaleString()})`
        });
      } else if (dept.usagePercentage > 90) {
        budgetAlerts.push({
          department: dept.department,
          severity: 'warning',
          message: `At ${dept.usagePercentage}% of budget - monitor closely`
        });
      }
    });
    
    // Monthly trends with budget data
    const monthlyTrends = reportsData.monthlyTrends.map(month => {
      const monthlyBudget = Math.round(totalBudget * 0.95 + (Math.random() * 0.1 * totalBudget)); // Slight variation
      const monthVariance = monthlyBudget - month.spend;
      let trend = 'neutral';
      
      if (month.spend > (monthlyBudget * 1.05)) trend = 'up';
      else if (month.spend < (monthlyBudget * 0.9)) trend = 'down';
      
      return {
        month: month.month,
        budget: monthlyBudget,
        actual: month.spend,
        variance: monthVariance,
        trend
      };
    });
    
    // Cost analysis
    const activeContractors = contractors.filter(c => c.status === 'active').length;
    const avgCostPerContractor = Math.round(actualSpend / activeContractors);
    const highestSpendDept = departmentBreakdown.reduce((max, dept) => 
      dept.actual > max.actual ? dept : max
    );
    const budgetUtilization = Math.round((actualSpend / totalBudget) * 100);
    
    return {
      reportId: Math.random().toString(36).substr(2, 9),
      reportType: 'budget-analysis',
      generatedAt: new Date().toISOString(),
      summary: {
        budgetPeriod: 'February 2024',
        totalBudget,
        actualSpend,
        variance,
        variancePercentage
      },
      departmentBreakdown: departmentBreakdown.sort((a, b) => b.actual - a.actual),
      budgetAlerts,
      monthlyTrends,
      costAnalysis: {
        avgCostPerContractor,
        highestSpendDept: highestSpendDept.department,
        highestSpendAmount: highestSpendDept.actual,
        budgetUtilization
      }
    };
  }
};