import reportsData from "@/services/mockData/reports.json";
import React from "react";
import { timesheetService } from "@/services/api/timesheetService";
import { contractorService } from "@/services/api/contractorService";

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
  },
  async generatePerformanceMetrics() {
    await delay(800);
    
    // Import contractor and timesheet data
    const { contractorService } = await import('./contractorService');
    const contractors = await contractorService.getAll();
    
    // Import timesheet data for performance calculations
    let timesheetData = [];
    try {
      const { timesheetService } = await import('./timesheetService');
      timesheetData = await timesheetService.getAll();
    } catch (error) {
      // If timesheet service not available, use mock performance data
      timesheetData = contractors.map(c => ({
        contractorId: c.Id,
        hoursWorked: Math.floor(Math.random() * 160) + 120, // 120-280 hours
        projectsCompleted: Math.floor(Math.random() * 8) + 2, // 2-10 projects
        efficiency: Math.floor(Math.random() * 30) + 70 // 70-100% efficiency
      }));
    }
    
    const activeContractors = contractors.filter(c => c.status === 'active');
    const totalContractors = activeContractors.length;
    
    // Calculate overall performance metrics
    const totalHoursWorked = timesheetData.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);
    const totalProjectsCompleted = timesheetData.reduce((sum, t) => sum + (t.projectsCompleted || 0), 0);
    const avgEfficiency = Math.round(timesheetData.reduce((sum, t) => sum + (t.efficiency || 75), 0) / timesheetData.length);
    const avgHoursPerContractor = Math.round(totalHoursWorked / totalContractors);
    
    // Performance categories
    const highPerformers = timesheetData.filter(t => t.efficiency >= 90).length;
    const goodPerformers = timesheetData.filter(t => t.efficiency >= 75 && t.efficiency < 90).length;
    const needsImprovement = timesheetData.filter(t => t.efficiency < 75).length;
    
    // Department performance analysis
    const departmentMap = new Map();
    activeContractors.forEach(contractor => {
      const dept = contractor.department;
      const perfData = timesheetData.find(t => t.contractorId === contractor.Id) || {
        hoursWorked: 150,
        projectsCompleted: 5,
        efficiency: 75
      };
      
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          department: dept,
          contractorCount: 0,
          totalHours: 0,
          totalProjects: 0,
          totalEfficiency: 0,
          highPerformers: 0
        });
      }
      
      const deptData = departmentMap.get(dept);
      deptData.contractorCount++;
      deptData.totalHours += perfData.hoursWorked;
      deptData.totalProjects += perfData.projectsCompleted;
      deptData.totalEfficiency += perfData.efficiency;
      if (perfData.efficiency >= 90) deptData.highPerformers++;
    });
    
    const departmentPerformance = Array.from(departmentMap.values()).map(dept => ({
      department: dept.department,
      contractorCount: dept.contractorCount,
      avgHours: Math.round(dept.totalHours / dept.contractorCount),
      avgProjects: Math.round(dept.totalProjects / dept.contractorCount),
      avgEfficiency: Math.round(dept.totalEfficiency / dept.contractorCount),
      highPerformerRate: Math.round((dept.highPerformers / dept.contractorCount) * 100),
      totalProjects: dept.totalProjects
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);
    
    // Top performers list
    const contractorPerformance = activeContractors.map(contractor => {
      const perfData = timesheetData.find(t => t.contractorId === contractor.Id) || {
        hoursWorked: 150,
        projectsCompleted: 5,
        efficiency: 75
      };
      
      return {
        name: contractor.name,
        department: contractor.department,
        hoursWorked: perfData.hoursWorked,
        projectsCompleted: perfData.projectsCompleted,
        efficiency: perfData.efficiency,
        rating: perfData.efficiency >= 90 ? 'Excellent' : 
                perfData.efficiency >= 80 ? 'Good' : 
                perfData.efficiency >= 70 ? 'Average' : 'Needs Improvement'
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
    
    const topPerformers = contractorPerformance.slice(0, 10);
    
    // Monthly performance trends
    const monthlyPerformance = [
      { month: 'Jan 2024', avgEfficiency: 78, projectsCompleted: 145, hoursWorked: 6240 },
      { month: 'Feb 2024', avgEfficiency: 82, projectsCompleted: 167, hoursWorked: 6890 },
      { month: 'Mar 2024', avgEfficiency: avgEfficiency, projectsCompleted: totalProjectsCompleted, hoursWorked: totalHoursWorked }
    ];
    
    // Performance insights
    const insights = [];
    
    if (avgEfficiency >= 85) {
      insights.push({
        type: 'success',
        title: 'Strong Overall Performance',
        message: `Team efficiency of ${avgEfficiency}% exceeds target benchmarks`
      });
    } else if (avgEfficiency < 75) {
      insights.push({
        type: 'warning',
        title: 'Performance Below Target',
        message: `Team efficiency of ${avgEfficiency}% requires attention and improvement plans`
      });
    }
    
    const topDept = departmentPerformance[0];
    insights.push({
      type: 'info',
      title: 'Top Performing Department',
      message: `${topDept.department} leads with ${topDept.avgEfficiency}% efficiency`
    });
    
    if (highPerformers / totalContractors > 0.3) {
      insights.push({
        type: 'success',
        title: 'Strong Talent Pool',
        message: `${Math.round((highPerformers / totalContractors) * 100)}% of contractors are high performers`
      });
    }
    
    return {
      reportId: Math.random().toString(36).substr(2, 9),
      reportType: 'performance-metrics',
      generatedAt: new Date().toISOString(),
      summary: {
        totalContractors,
        avgEfficiency,
        totalProjectsCompleted,
        avgHoursPerContractor,
        performancePeriod: 'March 2024'
      },
      performanceCategories: {
        highPerformers,
        goodPerformers,
        needsImprovement,
        highPerformerPercentage: Math.round((highPerformers / totalContractors) * 100)
      },
      departmentPerformance: departmentPerformance,
      topPerformers: topPerformers,
      monthlyPerformance: monthlyPerformance,
      insights: insights,
      kpiMetrics: {
        projectCompletionRate: Math.round((totalProjectsCompleted / (totalContractors * 6)) * 100), // Assuming 6 projects target per contractor
        utilizationRate: Math.round((totalHoursWorked / (totalContractors * 160)) * 100), // Assuming 160 hours target
        qualityScore: avgEfficiency,
        clientSatisfaction: Math.min(95, avgEfficiency + Math.floor(Math.random() * 10)) // Mock client satisfaction
      }
    };
  }