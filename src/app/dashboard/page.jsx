
// // 'use client'
// // import { useEffect, useState } from 'react'
// // import { useRouter } from 'next/navigation'
// // import Link from 'next/link'

// // export default function DashboardPage() {
// //   const [user, setUser] = useState(null)
// //   const [stats, setStats] = useState({
// //     totalMembers: 0,
// //     totalFund: 0,
// //     recentDeposits: 0
// //   })
// //   const [monthlyData, setMonthlyData] = useState([])
// //   const [expandedHistoryYear, setExpandedHistoryYear] = useState(null) // null or year like 2024
// //   const [historyData, setHistoryData] = useState({}) // Store multiple years data
// //   const router = useRouter()

// //   // Generate monthly data for the current year
// //   const generateMonthlyData = () => {
// //     const months = []
// //     const currentYear = new Date().getFullYear()
// //     const currentDate = new Date()
// //     const currentMonth = currentDate.getMonth() // 0-based month (0 = January)
// //     const currentDay = currentDate.getDate()
    
// //     for (let month = 0; month < 12; month++) {
// //       const date = new Date(currentYear, month, 25)
// //       const monthName = date.toLocaleDateString('en-US', { month: 'long' })
// //       const formattedDate = date.toISOString().split('T')[0]
      
// //       const totalCollected = Math.floor(Math.random() * 50000) + 50000
// //       const totalGiven = Math.floor(Math.random() * 40000) + 40000
// //       const remainingAmount = totalCollected - totalGiven
      
// //       // Determine status based on current date
// //       let status = 'completed'
      
// //       if (month > currentMonth) {
// //         // Future months
// //         status = 'upcoming'
// //       } else if (month === currentMonth) {
// //         // Current month - check if it's the 25th or later
// //         if (currentDay >= 25) {
// //           status = 'current' // Today is 25th or later in current month
// //         } else {
// //           status = 'upcoming' // Before 25th in current month
// //         }
// //       }
// //       // For previous months, status remains 'completed'
      
// //       months.push({
// //         id: month + 1,
// //         name: monthName,
// //         date: formattedDate,
// //         year: currentYear,
// //         totalCollected: totalCollected,
// //         totalGiven: totalGiven,
// //         remainingAmount: remainingAmount,
// //         status: status
// //       })
// //     }
    
// //     return months
// //   }

// //   // Generate data for any historical year
// //   const generateYearData = (year) => {
// //     const months = []
    
// //     for (let month = 0; month < 12; month++) {
// //       const date = new Date(year, month, 25)
// //       const monthName = date.toLocaleDateString('en-US', { month: 'long' })
// //       const formattedDate = date.toISOString().split('T')[0]
      
// //       const totalCollected = Math.floor(Math.random() * 50000) + 50000
// //       const totalGiven = Math.floor(Math.random() * 40000) + 40000
// //       const remainingAmount = totalCollected - totalGiven
      
// //       months.push({
// //         id: month + 1,
// //         name: monthName,
// //         date: formattedDate,
// //         year: year,
// //         totalCollected: totalCollected,
// //         totalGiven: totalGiven,
// //         remainingAmount: remainingAmount,
// //         status: 'completed' // All historical months are completed
// //       })
// //     }
    
// //     return months
// //   }

// //   // Generate financial years data (3-5 years back)
// //   const generateFinancialYears = () => {
// //     const currentYear = new Date().getFullYear()
// //     const years = {}
    
// //     // Generate data for current year and previous 4 years (total 5 years)
// //     for (let i = 4; i >= 0; i--) {
// //       const year = currentYear - i
// //       if (year < 2024) continue // Start from 2024 or your preferred start year
      
// //       years[year] = {
// //         title: `FY ${year}-${(year + 1).toString().slice(-2)}`,
// //         data: generateYearData(year),
// //         summary: {}
// //       }
      
// //       // Calculate summary for the year
// //       years[year].summary = {
// //         totalCollected: years[year].data.reduce((sum, month) => sum + month.totalCollected, 0),
// //         totalGiven: years[year].data.reduce((sum, month) => sum + month.totalGiven, 0),
// //         remainingAmount: years[year].data.reduce((sum, month) => sum + month.remainingAmount, 0)
// //       }
// //     }
    
// //     return years
// //   }

// //   // Check if all current year months are completed
// //   const allMonthsCompleted = monthlyData.every(month => month.status === 'completed')

// //   useEffect(() => {
// //     const isLoggedIn = localStorage.getItem('isLoggedIn')
// //     const userData = localStorage.getItem('user')
    
// //     if (isLoggedIn !== 'true' || !userData) {
// //       router.push('/login')
// //       return
// //     }

// //     setUser(JSON.parse(userData))
    
// //     // Load members from localStorage and calculate stats
// //     const savedMembers = JSON.parse(localStorage.getItem('members') || '[]')
    
// //     setStats({
// //       totalMembers: savedMembers.length,
// //       totalFund: 125000,
// //       recentDeposits: 12500
// //     })
    
// //     setMonthlyData(generateMonthlyData())
// //     setHistoryData(generateFinancialYears())
// //   }, [router])

// //   const handleLogout = () => {
// //     localStorage.removeItem('isLoggedIn')
// //     localStorage.removeItem('user')
// //     router.push('/login')
// //   }

// //   const getAmountColor = (amount) => {
// //     if (amount > 0) return 'text-green-600'
// //     if (amount < 0) return 'text-red-600'
// //     return 'text-gray-600'
// //   }

// //   const formatNumber = (number) => {
// //     if (number === undefined || number === null) return '0'
// //     return Number(number).toLocaleString()
// //   }

// //   const handleMonthClick = (monthData) => {
// //     router.push(`/month/${monthData.date}?name=${encodeURIComponent(monthData.name)}&year=${monthData.year}`)
// //   }

// //   const handleHistoryYearClick = (year) => {
// //     setExpandedHistoryYear(expandedHistoryYear === year ? null : year)
// //   }

// //   if (!user) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-100">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
// //           <p className="mt-4 text-gray-600">Loading...</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-100">
// //       <header className="bg-white shadow-sm border-b">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="flex justify-between items-center py-4">
// //             <h1 className="text-2xl font-bold text-gray-900">Fund Manager Dashboard</h1>
// //             <div className="flex items-center space-x-4">
// //               <span className="text-gray-700">Welcome, {user.name}</span>
// //               <button 
// //                 onClick={handleLogout} 
// //                 className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
// //               >
// //                 Logout
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
// //           <div className="bg-white rounded-lg shadow-md p-6 text-center">
// //             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Members</h3>
// //             <p className="text-3xl font-bold text-blue-600">{stats.totalMembers}</p>
// //           </div>
// //           <div className="bg-white rounded-lg shadow-md p-6 text-center">
// //             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Fund</h3>
// //             <p className="text-3xl font-bold text-green-600">₹ {formatNumber(stats.totalFund)}</p>
// //           </div>
// //           <div className="bg-white rounded-lg shadow-md p-6 text-center">
// //             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Deposits</h3>
// //             <p className="text-3xl font-bold text-purple-600">₹ {formatNumber(stats.recentDeposits)}</p>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
// //           <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             <Link 
// //               href="/members" 
// //               className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
// //             >
// //               <h3 className="font-semibold text-gray-800 mb-2">👥 Manage Members</h3>
// //               <p className="text-sm text-gray-600">Add, remove, or edit members</p>
// //             </Link>
// //             <Link 
// //               href="/deposits" 
// //               className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
// //             >
// //               <h3 className="font-semibold text-gray-800 mb-2">💰 Deposit Management</h3>
// //               <p className="text-sm text-gray-600">Track deposits and payments</p>
// //             </Link>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-lg shadow-md p-6">
// //           <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Collection - 25th of Each Month</h2>
          
// //           {/* Current Year Section */}
// //           <div className="mb-8">
// //             <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Year ({new Date().getFullYear()})</h3>
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //               {monthlyData.length > 0 ? monthlyData.map((month) => (
// //                 <div 
// //                   key={month.id}
// //                   onClick={() => handleMonthClick(month)}
// //                   className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
// //                 >
// //                   <div className="flex justify-between items-start mb-3">
// //                     <h3 className="font-semibold text-gray-800 text-lg">{month.name} {month.year}</h3>
// //                     {/* Status badge removed from here */}
// //                   </div>
                  
// //                   <div className="space-y-3">
// //                     <div className="flex justify-between text-sm">
// //                       <span className="text-gray-600">Total Collected:</span>
// //                       <span className="font-medium text-green-600">
// //                         ₹ {formatNumber(month.totalCollected)}
// //                       </span>
// //                     </div>
                    
// //                     <div className="flex justify-between text-sm">
// //                       <span className="text-gray-600">Total Given:</span>
// //                       <span className="font-medium text-blue-600">
// //                         ₹ {formatNumber(month.totalGiven)}
// //                       </span>
// //                     </div>
                    
// //                     <div className="flex justify-between text-sm">
// //                       <span className="text-gray-600">Remaining Amount:</span>
// //                       <span className={`font-medium ${getAmountColor(month.remainingAmount)}`}>
// //                          ₹ {formatNumber(month.remainingAmount)}
// //                       </span>
// //                     </div>
// //                   </div>
                  
// //                   <div className="mt-4 pt-3 border-t border-gray-100">
// //                     <button className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
// //                       View Details
// //                     </button>
// //                   </div>
// //                 </div>
// //               )) : (
// //                 <div className="col-span-full text-center py-8">
// //                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //                   <p className="text-gray-600">Loading monthly data...</p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //           {/* Financial History Section */}
// //           <div>
// //             <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial History</h3>
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //               {/* Current Year Summary Card */}
// //               {allMonthsCompleted && monthlyData.length > 0 && (
// //                 <div 
// //                   onClick={() => handleHistoryYearClick(new Date().getFullYear())}
// //                   className="border-2 border-dashed border-green-300 rounded-lg p-6 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[200px] bg-green-50"
// //                 >
// //                   <div className="text-4xl mb-3">📊</div>
// //                   <h3 className="text-xl font-bold text-gray-800 mb-2">FY {new Date().getFullYear()}-{(new Date().getFullYear() + 1).toString().slice(-2)}</h3>
// //                   <p className="text-gray-600 mb-3">Current Year Summary</p>
                  
// //                   <div className="space-y-2 text-sm w-full">
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600">Total Collected:</span>
// //                       <span className="font-medium text-green-600">
// //                         ₹ {formatNumber(monthlyData.reduce((sum, month) => sum + month.totalCollected, 0))}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600">Total Given:</span>
// //                       <span className="font-medium text-blue-600">
// //                         ₹ {formatNumber(monthlyData.reduce((sum, month) => sum + month.totalGiven, 0))}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600">Net Amount:</span>
// //                       <span className={`font-medium ${getAmountColor(monthlyData.reduce((sum, month) => sum + month.remainingAmount, 0))}`}>
// //                         ₹ {formatNumber(monthlyData.reduce((sum, month) => sum + month.remainingAmount, 0))}
// //                       </span>
// //                     </div>
// //                   </div>
                  
// //                   <div className="mt-4 w-full">
// //                     <button className="w-full bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors">
// //                       {expandedHistoryYear === new Date().getFullYear() ? 'Collapse' : 'View All Months'}
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Historical Years Cards */}
// //               {Object.keys(historyData)
// //                 .filter(year => year !== new Date().getFullYear().toString())
// //                 .sort((a, b) => parseInt(b) - parseInt(a))
// //                 .map(year => (
// //                   <div 
// //                     key={year}
// //                     onClick={() => handleHistoryYearClick(parseInt(year))}
// //                     className="border-2 border-dashed border-purple-300 rounded-lg p-6 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[200px] bg-purple-50"
// //                   >
// //                     <div className="text-4xl mb-3">📅</div>
// //                     <h3 className="text-xl font-bold text-gray-800 mb-2">{historyData[year].title}</h3>
// //                     <p className="text-gray-600 mb-3">Completed Financial Year</p>
                    
// //                     <div className="space-y-2 text-sm w-full">
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Total Collected:</span>
// //                         <span className="font-medium text-green-600">
// //                           ₹ {formatNumber(historyData[year].summary.totalCollected)}
// //                         </span>
// //                       </div>
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Total Given:</span>
// //                         <span className="font-medium text-blue-600">
// //                           ₹ {formatNumber(historyData[year].summary.totalGiven)}
// //                         </span>
// //                       </div>
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Net Amount:</span>
// //                         <span className={`font-medium ${getAmountColor(historyData[year].summary.remainingAmount)}`}>
// //                           ₹ {formatNumber(historyData[year].summary.remainingAmount)}
// //                         </span>
// //                       </div>
// //                     </div>
                    
// //                     <div className="mt-4 w-full">
// //                       <button className="w-full bg-purple-600 text-white py-2 px-3 rounded-md text-sm hover:bg-purple-700 transition-colors">
// //                         {expandedHistoryYear === parseInt(year) ? 'Collapse' : 'View All Months'}
// //                       </button>
// //                     </div>
// //                   </div>
// //                 ))
// //               }
// //             </div>

// //             {/* Expanded Year View - Shows below when a year card is clicked */}
// //             {expandedHistoryYear && historyData[expandedHistoryYear] && (
// //               <div className="mt-8 p-6 bg-gray-50 rounded-lg">
// //                 <div className="flex justify-between items-center mb-6">
// //                   <h3 className="text-lg font-semibold text-gray-800">
// //                     {historyData[expandedHistoryYear].title} - All Monthly Records
// //                   </h3>
// //                   <button 
// //                     onClick={() => setExpandedHistoryYear(null)}
// //                     className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
// //                   >
// //                     Collapse
// //                   </button>
// //                 </div>
                
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //                   {historyData[expandedHistoryYear].data.map((month) => (
// //                     <div 
// //                       key={`${expandedHistoryYear}-${month.id}`}
// //                       onClick={() => handleMonthClick(month)}
// //                       className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
// //                     >
// //                       <div className="flex justify-between items-start mb-3">
// //                         <h3 className="font-semibold text-gray-800 text-lg">{month.name} {month.year}</h3>
// //                         {/* Status badge removed from here as well */}
// //                       </div>
                      
// //                       <div className="space-y-3">
// //                         <div className="flex justify-between text-sm">
// //                           <span className="text-gray-600">Total Collected:</span>
// //                           <span className="font-medium text-green-600">
// //                             ₹ {formatNumber(month.totalCollected)}
// //                           </span>
// //                         </div>
                        
// //                         <div className="flex justify-between text-sm">
// //                           <span className="text-gray-600">Total Given:</span>
// //                           <span className="font-medium text-blue-600">
// //                             ₹ {formatNumber(month.totalGiven)}
// //                           </span>
// //                         </div>
                        
// //                         <div className="flex justify-between text-sm">
// //                           <span className="text-gray-600">Remaining Amount:</span>
// //                           <span className={`font-medium ${getAmountColor(month.remainingAmount)}`}>
// //                             ₹ {formatNumber(month.remainingAmount)}
// //                           </span>
// //                         </div>
// //                       </div>
                      
// //                       <div className="mt-4 pt-3 border-t border-gray-100">
// //                         <button className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
// //                           View Details
// //                         </button>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}
            
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   )
// // }




// 'use client'
// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import banner from '../../../assets/ban.png';

// export default function DashboardPage() {
//   const [user, setUser] = useState(null)
//   const [stats, setStats] = useState({
//     totalMembers: 0,
//     totalFund: 0,
//     recentDeposits: 0
//   })
//   const [monthlyData, setMonthlyData] = useState([])
//   const [expandedHistoryYear, setExpandedHistoryYear] = useState(null)
//   const [historyData, setHistoryData] = useState({})
//   const router = useRouter()

//   // Generate monthly data for the current year
//   const generateMonthlyData = () => {
//     const months = []
//     const currentYear = new Date().getFullYear()
//     const currentDate = new Date()
//     const currentMonth = currentDate.getMonth()
//     const currentDay = currentDate.getDate()
    
//     for (let month = 0; month < 12; month++) {
//       const date = new Date(currentYear, month, 25)
//       const monthName = date.toLocaleDateString('en-US', { month: 'long' })
//       const formattedDate = date.toISOString().split('T')[0]
//       const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`
      
//       // Use default data since localStorage is disabled
//       const allMembers = [
//         { id: 1, name: 'Alice Johnson', isBorrower: false },
//         { id: 2, name: 'Bob Smith', isBorrower: true },
//         { id: 3, name: 'Charlie Brown', isBorrower: true },
//         { id: 4, name: 'David Wilson', isBorrower: false },
//         { id: 5, name: 'Emma Davis', isBorrower: true },
//       ]
      
//       const paidMembers = Math.floor(Math.random() * allMembers.length)
      
//       let totalCollected = 0
//       let totalGiven = 0
      
//       // Use random data for all months
//       totalCollected = Math.floor(Math.random() * 50000) + 50000
//       totalGiven = Math.floor(Math.random() * 40000) + 40000
      
//       const remainingAmount = totalCollected - totalGiven
      
//       // Determine status - Remove completed status logic
//       let status = 'upcoming'
//       if (month === currentMonth) {
//         status = currentDay >= 25 ? 'current' : 'upcoming'
//       } else if (month > currentMonth) {
//         status = 'upcoming'
//       } else {
//         status = 'upcoming' // All past months are also upcoming, not completed
//       }
      
//       months.push({
//         id: month + 1,
//         name: monthName,
//         date: formattedDate,
//         year: currentYear,
//         totalCollected: totalCollected,
//         totalGiven: totalGiven,
//         remainingAmount: remainingAmount,
//         status: status,
//         monthKey: monthKey,
//         paidMembers: paidMembers,
//         totalMembers: allMembers.length
//       })
//     }
    
//     return months
//   }

//   // Generate data for any historical year
//   const generateYearData = (year) => {
//     const months = []
    
//     for (let month = 0; month < 12; month++) {
//       const date = new Date(year, month, 25)
//       const monthName = date.toLocaleDateString('en-US', { month: 'long' })
//       const formattedDate = date.toISOString().split('T')[0]
//       const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
      
//       // Generate random paid members data for historical months
//       const paidMembers = Math.floor(Math.random() * 5) + 1
//       const totalMembers = 5
      
//       const totalCollected = Math.floor(Math.random() * 50000) + 50000
//       const totalGiven = Math.floor(Math.random() * 40000) + 40000
//       const remainingAmount = totalCollected - totalGiven
      
//       months.push({
//         id: month + 1,
//         name: monthName,
//         date: formattedDate,
//         year: year,
//         totalCollected: totalCollected,
//         totalGiven: totalGiven,
//         remainingAmount: remainingAmount,
//         status: 'upcoming',
//         monthKey: monthKey,
//         paidMembers: paidMembers,
//         totalMembers: totalMembers
//       })
//     }
    
//     return months
//   }

//   // Generate financial years data
//   const generateFinancialYears = () => {
//     const currentYear = new Date().getFullYear()
//     const years = {}
    
//     for (let i = 4; i >= 0; i--) {
//       const year = currentYear - i
//       if (year < 2024) continue
      
//       years[year] = {
//         title: `FY ${year}-${(year + 1).toString().slice(-2)}`,
//         data: generateYearData(year),
//         summary: {}
//       }
      
//       years[year].summary = {
//         totalCollected: years[year].data.reduce((sum, month) => sum + month.totalCollected, 0),
//         totalGiven: years[year].data.reduce((sum, month) => sum + month.totalGiven, 0),
//         remainingAmount: years[year].data.reduce((sum, month) => sum + month.remainingAmount, 0)
//       }
//     }
    
//     return years
//   }

//   useEffect(() => {
//     // Simulate user authentication without localStorage
//     const mockUser = { name: 'Admin User', email: 'admin@chitfund.com' }
//     setUser(mockUser)
    
//     // Load members from mock data and calculate stats
//     const mockMembers = [
//       { id: 1, name: 'Alice Johnson', isBorrower: false },
//       { id: 2, name: 'Bob Smith', isBorrower: true },
//       { id: 3, name: 'Charlie Brown', isBorrower: true },
//       { id: 4, name: 'David Wilson', isBorrower: false },
//       { id: 5, name: 'Emma Davis', isBorrower: true },
//     ]
    
//     // Calculate mock fund totals
//     const totalCollected = 125000
    
//     setStats({
//       totalMembers: mockMembers.length,
//       totalFund: totalCollected,
//       recentDeposits: 12500
//     })
    
//     setMonthlyData(generateMonthlyData())
//     setHistoryData(generateFinancialYears())
//   }, [router])

//   const handleLogout = () => {
//     // Since localStorage is disabled, just redirect
//     router.push('/login')
//   }

//   const getAmountColor = (amount) => {
//     if (amount > 0) return 'text-green-600'
//     if (amount < 0) return 'text-red-600'
//     return 'text-gray-600'
//   }

//   const formatNumber = (number) => {
//     if (number === undefined || number === null) return '0'
//     return Number(number).toLocaleString()
//   }

//   const handleMonthClick = (monthData) => {
//     router.push(`/month/${monthData.date}?name=${encodeURIComponent(monthData.name)}&year=${monthData.year}`)
//   }

//   const handleHistoryYearClick = (year) => {
//     setExpandedHistoryYear(expandedHistoryYear === year ? null : year)
//   }

//   const handleHistoryMonthClick = (monthData) => {
//     // For historical months, we can still navigate but show a read-only view
//     router.push(`/month/${monthData.date}?name=${encodeURIComponent(monthData.name)}&year=${monthData.year}&historical=true`)
//   }

//   // Updated payment status badge function for all months
//   const getPaymentStatusBadge = (month) => {
//     if (month.paidMembers > 0) {
//       return (
//         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//           {month.paidMembers}/{month.totalMembers} Paid
//         </span>
//       )
//     }
//     return (
//       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//         No payments
//       </span>
//     )
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <h1 className="text-2xl font-bold text-gray-900">Fund Manager Dashboard</h1>
//             <div className="flex items-center space-x-4">
//               <span className="text-gray-700">Welcome, {user.name}</span>
//               <button 
//                 onClick={handleLogout} 
//                 className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Banner Section */}
//         <div className="mb-8">
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <img
//               src={banner.src}
//               alt="Financial Management Banner"
//               className="w-full h-80 object-cover"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Members</h3>
//             <p className="text-3xl font-bold text-blue-600">{stats.totalMembers}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Fund</h3>
//             <p className="text-3xl font-bold text-green-600">₹ {formatNumber(stats.totalFund)}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Deposits</h3>
//             <p className="text-3xl font-bold text-purple-600">₹ {formatNumber(stats.recentDeposits)}</p>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Link 
//               href="/members" 
//               className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
//             >
//               <h3 className="font-semibold text-gray-800 mb-2">👥 Manage Members</h3>
//               <p className="text-sm text-gray-600">Add, remove, or edit members</p>
//             </Link>
//             <Link 
//               href="/deposits" 
//               className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
//             >
//               <h3 className="font-semibold text-gray-800 mb-2">💰 Deposit Management</h3>
//               <p className="text-sm text-gray-600">Track deposits and payments</p>
//             </Link>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Collection - 25th of Each Month</h2>
          
//           {/* Current Year Section */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Year ({new Date().getFullYear()})</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {monthlyData.length > 0 ? monthlyData.map((month) => (
//                 <div 
//                   key={month.id}
//                   onClick={() => handleMonthClick(month)}
//                   className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <h3 className="font-semibold text-gray-800 text-lg">{month.name} {month.year}</h3>
//                     {getPaymentStatusBadge(month)}
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Total Collected:</span>
//                       <span className="font-medium text-green-600">
//                         ₹ {formatNumber(month.totalCollected)}
//                       </span>
//                     </div>
                    
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Total Given:</span>
//                       <span className="font-medium text-blue-600">
//                         ₹ {formatNumber(month.totalGiven)}
//                       </span>
//                     </div>
                    
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Remaining Amount:</span>
//                       <span className={`font-medium ${getAmountColor(month.remainingAmount)}`}>
//                         ₹ {formatNumber(month.remainingAmount)}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4 pt-3 border-t border-gray-100">
//                     <button className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
//                       Manage Payments
//                     </button>
//                   </div>
//                 </div>
//               )) : (
//                 <div className="col-span-full text-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                   <p className="text-gray-600">Loading monthly data...</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Financial History Section - Updated to match current year cards */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial History</h3>
//             <div className="space-y-4">
//               {Object.entries(historyData).map(([year, yearData]) => (
//                 <div key={year} className="border border-gray-200 rounded-lg">
//                   <div 
//                     className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
//                     onClick={() => handleHistoryYearClick(year)}
//                   >
//                     <h4 className="font-semibold text-gray-800">{yearData.title}</h4>
//                     <svg 
//                       className={`w-5 h-5 transform transition-transform ${
//                         expandedHistoryYear === year ? 'rotate-180' : ''
//                       }`} 
//                       fill="none" 
//                       stroke="currentColor" 
//                       viewBox="0 0 24 24"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </div>
                  
//                   {expandedHistoryYear === year && (
//                     <div className="p-4 border-t border-gray-200">
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
//                         {yearData.data.map((month) => (
//                           <div 
//                             key={month.id}
//                             onClick={() => handleHistoryMonthClick(month)}
//                             className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
//                           >
//                             <div className="flex justify-between items-start mb-3">
//                               <h3 className="font-semibold text-gray-800 text-lg">{month.name} {month.year}</h3>
//                               {getPaymentStatusBadge(month)}
//                             </div>
                            
//                             <div className="space-y-3">
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-600">Total Collected:</span>
//                                 <span className="font-medium text-green-600">
//                                   ₹ {formatNumber(month.totalCollected)}
//                                 </span>
//                               </div>
                              
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-600">Total Given:</span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹ {formatNumber(month.totalGiven)}
//                                 </span>
//                               </div>
                              
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-600">Remaining Amount:</span>
//                                 <span className={`font-medium ${getAmountColor(month.remainingAmount)}`}>
//                                   ₹ {formatNumber(month.remainingAmount)}
//                                 </span>
//                               </div>
//                             </div>
                            
//                             <div className="mt-4 pt-3 border-t border-gray-100">
//                               <button className="w-full bg-gray-600 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-700 transition-colors">
//                                 View Details
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
                      
//                       {/* Year Summary - Matching the style but updated for history */}
//                       <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                         <h5 className="font-semibold text-gray-800 mb-2">Year Summary</h5>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//                           <div className="text-center p-3 bg-white rounded border border-gray-200">
//                             <div className="text-gray-600 mb-1">Total Collected</div>
//                             <div className="font-semibold text-lg text-green-600">₹ {formatNumber(yearData.summary.totalCollected)}</div>
//                           </div>
//                           <div className="text-center p-3 bg-white rounded border border-gray-200">
//                             <div className="text-gray-600 mb-1">Total Given</div>
//                             <div className="font-semibold text-lg text-blue-600">₹ {formatNumber(yearData.summary.totalGiven)}</div>
//                           </div>
//                           <div className="text-center p-3 bg-white rounded border border-gray-200">
//                             <div className="text-gray-600 mb-1">Net Balance</div>
//                             <div className={`font-semibold text-lg ${getAmountColor(yearData.summary.remainingAmount)}`}>
//                               ₹ {formatNumber(yearData.summary.remainingAmount)}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }


'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import banner from '../../../assets/ban.png'
import { authAPI, dashboardAPI, monthsAPI } from '@/lib/api-client'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFund: 0,
    recentDeposits: 0
  })
  const [monthlyData, setMonthlyData] = useState([])
  const [expandedHistoryYear, setExpandedHistoryYear] = useState(null)
  const [historyData, setHistoryData] = useState({})
  const router = useRouter()

  // Generate monthly data for the current year from API
  const generateMonthlyData = async () => {
    const months = []
    const currentYear = new Date().getFullYear()
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 25)
      const monthName = date.toLocaleDateString('en-US', { month: 'long' })
      const formattedDate = date.toISOString().split('T')[0]
      
      try {
        // Fetch or create monthly data from API
        const response = await monthsAPI.getByDate(formattedDate)
        const monthData = response.data.monthlyData
        
        // Determine status
        let status = 'upcoming'
        if (month === currentMonth) {
          status = currentDate.getDate() >= 25 ? 'current' : 'upcoming'
        } else if (month < currentMonth) {
          status = monthData.paidMembers > 0 ? 'current' : 'upcoming'
        }
        
        months.push({
          id: month + 1,
          name: monthName,
          date: formattedDate,
          year: currentYear,
          totalCollected: monthData.totalCollected || 0,
          totalGiven: monthData.totalGiven || 0,
          remainingAmount: monthData.remainingAmount || 0,
          status: status,
          monthKey: `${currentYear}-${String(month + 1).padStart(2, '0')}`,
          paidMembers: monthData.paidMembers || 0,
          totalMembers: monthData.totalMembers || 0
        })
      } catch (error) {
        console.error(`Error fetching month ${month + 1}:`, error)
        // Add default data if API fails
        months.push({
          id: month + 1,
          name: monthName,
          date: formattedDate,
          year: currentYear,
          totalCollected: 0,
          totalGiven: 0,
          remainingAmount: 0,
          status: 'upcoming',
          monthKey: `${currentYear}-${String(month + 1).padStart(2, '0')}`,
          paidMembers: 0,
          totalMembers: 0
        })
      }
    }
    
    return months
  }

  // Generate financial years data from API
  const generateFinancialYears = async () => {
    const currentYear = new Date().getFullYear()
    const years = {}
    
    try {
      // Fetch all monthly data
      const response = await monthsAPI.getAll()
      const allMonthsData = response.data
      
      // Group by year
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i
        if (year < 2024) continue
        
        const yearMonths = allMonthsData.filter(m => m.year === year)
        
        // Create months array for the year
        const monthsArray = []
        for (let month = 1; month <= 12; month++) {
          const monthData = yearMonths.find(m => m.month === month)
          const date = new Date(year, month - 1, 25)
          const monthName = date.toLocaleDateString('en-US', { month: 'long' })
          const formattedDate = date.toISOString().split('T')[0]
          
          monthsArray.push({
            id: month,
            name: monthName,
            date: formattedDate,
            year: year,
            totalCollected: monthData?.totalCollected || 0,
            totalGiven: monthData?.totalGiven || 0,
            remainingAmount: monthData?.remainingAmount || 0,
            status: 'upcoming',
            monthKey: `${year}-${String(month).padStart(2, '0')}`,
            paidMembers: monthData?.paidMembers || 0,
            totalMembers: monthData?.totalMembers || 0
          })
        }
        
        years[year] = {
          title: `FY ${year}-${(year + 1).toString().slice(-2)}`,
          data: monthsArray,
          summary: {
            totalCollected: monthsArray.reduce((sum, m) => sum + m.totalCollected, 0),
            totalGiven: monthsArray.reduce((sum, m) => sum + m.totalGiven, 0),
            remainingAmount: monthsArray.reduce((sum, m) => sum + m.remainingAmount, 0)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching financial years:', error)
    }
    
    return years
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        
        // Check authentication
        const userResponse = await authAPI.getMe()
        setUser(userResponse.data)
        
        // Load dashboard stats
        const statsResponse = await dashboardAPI.getStats()
        setStats({
          totalMembers: statsResponse.data.members.total,
          totalFund: statsResponse.data.deposits.total,
          recentDeposits: statsResponse.data.deposits.recent
        })
        
        // Load monthly data for current year
        const currentYearData = await generateMonthlyData()
        setMonthlyData(currentYearData)
        
        // Load historical data
        const historicalData = await generateFinancialYears()
        setHistoryData(historicalData)
        
      } catch (error) {
        console.error('Dashboard load error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const handleLogout = async () => {
    await authAPI.logout()
    router.push('/login')
  }

  const getAmountColor = (amount) => {
    if (amount > 0) return 'text-green-600'
    if (amount < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatNumber = (number) => {
    if (number === undefined || number === null) return '0'
    return Number(number).toLocaleString()
  }

  const handleMonthClick = (monthData) => {
    router.push(`/month/${monthData.date}?name=${encodeURIComponent(monthData.name)}&year=${monthData.year}`)
  }

  const handleHistoryYearClick = (year) => {
    setExpandedHistoryYear(expandedHistoryYear === year ? null : year)
  }

  const handleHistoryMonthClick = (monthData) => {
    router.push(`/month/${monthData.date}?name=${encodeURIComponent(monthData.name)}&year=${monthData.year}&historical=true`)
  }

  const getPaymentStatusBadge = (month) => {
    if (month.paidMembers > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {month.paidMembers}/{month.totalMembers} Paid
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        No payments
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Fund Manager Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={banner.src}
              alt="Financial Management Banner"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Members</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalMembers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Fund</h3>
            <p className="text-3xl font-bold text-green-600">₹ {formatNumber(stats.totalFund)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Deposits</h3>
            <p className="text-3xl font-bold text-purple-600">₹ {formatNumber(stats.recentDeposits)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/members" 
              className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 mb-2">👥 Manage Members</h3>
              <p className="text-sm text-gray-600">Add, remove, or edit members</p>
            </Link>
            <Link 
              href="/deposits" 
              className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 mb-2">💰 Deposit Management</h3>
              <p className="text-sm text-gray-600">Track deposits and payments</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Collection - 25th of Each Month</h2>
          
          {/* Current Year Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Year ({new Date().getFullYear()})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {monthlyData.length > 0 ? monthlyData.map((month) => (
                <div 
                  key={month.id}
                  onClick={() => handleMonthClick(month)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 text-lg">{month.name} {month.year}</h3>
                    {getPaymentStatusBadge(month)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Collected:</span>
                      <span className="font-medium text-green-600">
                        ₹ {formatNumber(month.totalCollected)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Given:</span>
                      <span className="font-medium text-blue-600">
                        ₹ {formatNumber(month.totalGiven)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining Amount:</span>
                      <span className={`font-medium ${getAmountColor(month.remainingAmount)}`}>
                        ₹ {formatNumber(month.remainingAmount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Manage Payments
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading monthly data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial History Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial History</h3>
            <div className="space-y-4">
              {Object.entries(historyData).map(([year, yearData]) => (
                <div key={year} className="border border-gray-200 rounded-lg">
                  <div 
                    className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleHistoryYearClick(year)}
                  >
                    <h4 className="font-semibold text-gray-800">{yearData.title}</h4>
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${
                        expandedHistoryYear === year ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {expandedHistoryYear === year && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                        {yearData.data.map((month) => (
                          <div 
                            key={month.id}
                            onClick={() => handleHistoryMonthClick(month)}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-800 text-lg">{month.name} {month.year}</h3>
                              {getPaymentStatusBadge(month)}
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Collected:</span>
                                <span className="font-medium text-green-600">
                                  ₹ {formatNumber(month.totalCollected)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Given:</span>
                                <span className="font-medium text-blue-600">
                                  ₹ {formatNumber(month.totalGiven)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Remaining Amount:</span>
                                <span className={`font-medium ${getAmountColor(month.remainingAmount)}`}>
                                  ₹ {formatNumber(month.remainingAmount)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <button className="w-full bg-gray-600 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-700 transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">Year Summary</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-3 bg-white rounded border border-gray-200">
                            <div className="text-gray-600 mb-1">Total Collected</div>
                            <div className="font-semibold text-lg text-green-600">₹ {formatNumber(yearData.summary.totalCollected)}</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded border border-gray-200">
                            <div className="text-gray-600 mb-1">Total Given</div>
                            <div className="font-semibold text-lg text-blue-600">₹ {formatNumber(yearData.summary.totalGiven)}</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded border border-gray-200">
                            <div className="text-gray-600 mb-1">Net Balance</div>
                            <div className={`font-semibold text-lg ${getAmountColor(yearData.summary.remainingAmount)}`}>
                              ₹ {formatNumber(yearData.summary.remainingAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}









































































