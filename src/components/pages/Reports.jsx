import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { reportService } from '@/services/api/reportService'
import ApperIcon from '@/components/ApperIcon'
import StatsCard from "@/components/molecules/StatsCard";
import Contractors from "@/components/pages/Contractors";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";

const Reports = () => {
const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await reportService.getReportData();
        setReports(data);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);
const handleGenerateReport = async (reportType) => {
    if (reportType !== 'Contractor Summary' && reportType !== 'Budget Analysis') {
      toast.info(`${reportType} generation coming soon!`);
      return;
    }

setGeneratingReport(reportType);
    try {
      let reportData;
      if (reportType === 'Contractor Summary') {
        reportData = await reportService.generateContractorSummary();
      } else if (reportType === 'Budget Analysis') {
        reportData = await reportService.generateBudgetAnalysis();
      }
      setGeneratedReport(reportData);
      setShowReportModal(true);
      toast.success(`${reportType} report generated successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(null);
    }
  };

  const reportStats = [
    {
      title: 'Total Contractors',
      value: reports.totalContractors || 0,
      change: '+5 this month',
      icon: 'Users',
      trend: 'up'
    },
    {
      title: 'Active Departments',
      value: reports.activeDepartments || 0,
      change: '12 departments',
      icon: 'Building2',
      trend: 'neutral'
    },
    {
      title: 'Monthly Spend',
      value: `$${(reports.monthlySpend || 0).toLocaleString()}`,
      change: '+12% vs last month',
      icon: 'DollarSign',
      trend: 'up'
    },
    {
      title: 'Avg. Contract Length',
      value: `${reports.avgContractLength || 0} days`,
      change: '180 days average',
      icon: 'Calendar',
      trend: 'neutral'
    }
  ];

const quickReports = [
    {
      title: 'Contractor Summary',
      description: 'Active contractors by department and status',
      icon: 'Users',
      action: 'Generate'
    },
    {
      title: 'Budget Analysis',
      description: 'Monthly spending and budget utilization',
      icon: 'DollarSign',
      action: 'Generate'
    },
    {
      title: 'Timesheet Report',
      description: 'Hours worked and overtime analysis',
      icon: 'Clock',
      action: 'Generate'
    },
    {
      title: 'Performance Metrics',
      description: 'KPIs and contractor performance data',
      icon: 'BarChart3',
      action: 'Generate'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and analyze contractor management reports and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              trend={stat.trend}
              loading={loading}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Quick Reports</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
{quickReports.map((report) => (
                <motion.div
                  key={report.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name={report.icon} className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                      <p className="text-xs text-gray-500">{report.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport(report.title)}
                    disabled={generatingReport === report.title}
                  >
                    {generatingReport === report.title ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      report.action
                    )}
                  </Button>
                </motion.div>
              ))}
              
              {/* Report Modal */}
              {showReportModal && generatedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                  >
<div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{generatedReport.reportType === 'budget-analysis' ? 'Budget Analysis Report' : 'Contractor Summary Report'}</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReportModal(false)}
                      >
                        <ApperIcon name="X" size={16} />
                      </Button>
                    </div>
                    
<div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      {/* Report Header */}
                      <div className="mb-6">
                        <p className="text-sm text-gray-600">Generated on: {new Date(generatedReport.generatedAt).toLocaleString()}</p>
                        {generatedReport.reportType === 'budget-analysis' ? (
                          <p className="text-sm text-gray-600">Budget Period: {generatedReport.summary.budgetPeriod}</p>
                        ) : (
                          <p className="text-sm text-gray-600">Total Contractors: {generatedReport.summary.totalContractors}</p>
                        )}
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {generatedReport.reportType === 'budget-analysis' ? (
                          <>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h3 className="text-sm font-medium text-blue-800">Total Budget</h3>
                              <p className="text-2xl font-bold text-blue-900">${generatedReport.summary.totalBudget.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h3 className="text-sm font-medium text-green-800">Actual Spend</h3>
                              <p className="text-2xl font-bold text-green-900">${generatedReport.summary.actualSpend.toLocaleString()}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${generatedReport.summary.variance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                              <h3 className={`text-sm font-medium ${generatedReport.summary.variance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                Budget Variance
                              </h3>
                              <p className={`text-2xl font-bold ${generatedReport.summary.variance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                                {generatedReport.summary.variance >= 0 ? '+' : ''}${generatedReport.summary.variance.toLocaleString()}
                              </p>
                              <p className={`text-xs ${generatedReport.summary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {generatedReport.summary.variancePercentage}%
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h3 className="text-sm font-medium text-green-800">Active Contractors</h3>
                              <p className="text-2xl font-bold text-green-900">{generatedReport.summary.activeContractors}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h3 className="text-sm font-medium text-blue-800">Departments</h3>
                              <p className="text-2xl font-bold text-blue-900">{generatedReport.summary.activeDepartments}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <h3 className="text-sm font-medium text-purple-800">Total Monthly Cost</h3>
                              <p className="text-2xl font-bold text-purple-900">${generatedReport.summary.totalMonthlyCost.toLocaleString()}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Department Breakdown */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {generatedReport.reportType === 'budget-analysis' ? 'Department Budget Analysis' : 'Department Breakdown'}
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                {generatedReport.reportType === 'budget-analysis' ? (
                                  <>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage %</th>
                                  </>
                                ) : (
                                  <>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inactive</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Cost</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {generatedReport.departmentBreakdown.map((dept, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.department}</td>
                                  {generatedReport.reportType === 'budget-analysis' ? (
                                    <>
                                      <td className="px-4 py-3 text-sm text-gray-900">${dept.budget.toLocaleString()}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">${dept.actual.toLocaleString()}</td>
                                      <td className={`px-4 py-3 text-sm font-medium ${dept.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {dept.variance >= 0 ? '+' : ''}${dept.variance.toLocaleString()}
                                      </td>
                                      <td className={`px-4 py-3 text-sm font-medium ${dept.usagePercentage > 100 ? 'text-red-600' : dept.usagePercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {dept.usagePercentage}%
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-4 py-3 text-sm text-gray-900">{dept.activeCount}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{dept.inactiveCount}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">${dept.averageRate}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">${dept.monthlyCost.toLocaleString()}</td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {generatedReport.reportType === 'budget-analysis' ? (
                        <>
                          {/* Budget Alerts */}
                          {generatedReport.budgetAlerts && generatedReport.budgetAlerts.length > 0 && (
                            <div className="mb-8">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Alerts</h3>
                              <div className="space-y-3">
                                {generatedReport.budgetAlerts.map((alert, index) => (
                                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                                    alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                                    alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                                    'bg-blue-50 border-blue-400'
                                  }`}>
                                    <div className="flex items-center">
                                      <ApperIcon 
                                        name={alert.severity === 'critical' ? 'AlertTriangle' : alert.severity === 'warning' ? 'AlertCircle' : 'Info'} 
                                        size={16} 
                                        className={`mr-2 ${
                                          alert.severity === 'critical' ? 'text-red-600' :
                                          alert.severity === 'warning' ? 'text-yellow-600' :
                                          'text-blue-600'
                                        }`}
                                      />
                                      <p className={`text-sm font-medium ${
                                        alert.severity === 'critical' ? 'text-red-800' :
                                        alert.severity === 'warning' ? 'text-yellow-800' :
                                        'text-blue-800'
                                      }`}>
                                        {alert.department}: {alert.message}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Monthly Trends */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {generatedReport.monthlyTrends.map((month, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{month.month}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">${month.budget.toLocaleString()}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">${month.actual.toLocaleString()}</td>
                                      <td className={`px-4 py-3 text-sm font-medium ${month.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {month.variance >= 0 ? '+' : ''}${month.variance.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        <ApperIcon 
                                          name={month.trend === 'up' ? 'TrendingUp' : month.trend === 'down' ? 'TrendingDown' : 'Minus'} 
                                          size={16} 
                                          className={`${
                                            month.trend === 'up' ? 'text-red-500' : 
                                            month.trend === 'down' ? 'text-green-500' : 
                                            'text-gray-500'
                                          }`}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Cost Analysis */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Avg Cost per Contractor</p>
                                <p className="text-xl font-bold text-gray-900">${generatedReport.costAnalysis.avgCostPerContractor.toLocaleString()}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Highest Dept Spend</p>
                                <p className="text-xl font-bold text-gray-900">{generatedReport.costAnalysis.highestSpendDept}</p>
                                <p className="text-xs text-gray-600">${generatedReport.costAnalysis.highestSpendAmount.toLocaleString()}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Budget Utilization</p>
                                <p className="text-xl font-bold text-gray-900">{generatedReport.costAnalysis.budgetUtilization}%</p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Status Distribution */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {generatedReport.statusDistribution.map((status, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                                  <p className="text-xs text-gray-600 uppercase tracking-wide">{status.status}</p>
                                  <p className="text-xl font-bold text-gray-900">{status.count}</p>
                                  <p className="text-xs text-gray-600">{status.percentage}%</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Contract Duration Analysis */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Duration Analysis</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-xs text-gray-600">Ending in 30 days</p>
                                  <p className="text-lg font-semibold text-red-600">{generatedReport.contractAnalysis.endingIn30Days}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Ending in 60 days</p>
                                  <p className="text-lg font-semibold text-yellow-600">{generatedReport.contractAnalysis.endingIn60Days}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Long-term (&gt;90 days)</p>
                                  <p className="text-lg font-semibold text-green-600">{generatedReport.contractAnalysis.longTerm}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const dataStr = JSON.stringify(generatedReport, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
link.download = `${generatedReport.reportType}-${new Date().toISOString().split('T')[0]}.json`;
                          link.click();
                          link.click();
                          URL.revokeObjectURL(url);
                          toast.success('Report downloaded successfully!');
                        }}
                      >
                        <ApperIcon name="Download" size={16} className="mr-2" />
                        Download JSON
                      </Button>
                      <Button onClick={() => setShowReportModal(false)}>
                        Close
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Recent Downloads</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="FileText" className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Monthly Report {i + 1}</p>
                      <p className="text-xs text-gray-500">Downloaded 2 hours ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="Download" className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Reports;