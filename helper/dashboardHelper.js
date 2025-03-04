const order = require("../model/orders");
const product = require("../model/productModel");
const category = require("../model/categoryModel");
const usercollection = require("../model/userModel");
const AppError = require("../middleware/errorHandling");

function getRandomColor() {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

function fillMissingRevenue(data, days = 14) {
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
  
      const existingData = data.find(entry => entry._id === formattedDate);
      result.push(existingData || { _id: formattedDate, dailyRevenue: 0 });
    }
  
    return result;
}

const completedOrders = async()=>{
    try {
        const completedOrdersCount = await order.countDocuments({status:"Delivered"})
        return completedOrdersCount
    } catch (error) {
        console.log("CompletedOrders Error:",error)        
    }
}

const ordersToShip = async()=>{
    try {
        const ordersToShipCount = await order.countDocuments({status:"Pending"})
        return ordersToShipCount
    } catch (error) {
        console.log("ordersToShip Error:",error)
    }
}

const todayIncome = async()=>{
    try {
        const today = new Date();
        const result = await order.aggregate([
            { 
                $match: { 
                    deliveryDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
                    status: 'Delivered' 
                } 
            },
            { $group: { _id: "", totalRevenue: { $sum: "$priceDetails.subTotal" } } },
        ]);
        return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
        console.log("todayIncome Error:",error)
    }
}

const productCount = async()=>{
    try {
        const total = await product.countDocuments({})
        const categories = await category.countDocuments({})
        const productCount = {total,categories}
        return productCount
    } catch (error) {
        console.log("productCount Error:",error)
    }
}

const totalRevenue = async()=>{
    try {
        const revenue = await order.aggregate([
            {
                $match:{ status : "Delivered"}
            },
            {
                $group:{
                    _id: null,
                    totalRevenue:{$sum:"$priceDetails.subTotal"}
                }
            }
        ])
        return revenue.length > 0 ? revenue[0].totalRevenue : 0
    } catch (error) {
        console.log("totalRevenue Error:",error)
    }
}

const monthlyRevenue = async()=>{
    try {
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);

        const result = await order.aggregate([
            { 
                $match: { 
                    deliveryDate: { $gte: lastMonth, $lte: today }, 
                    status: "Delivered" 
                } 
            },
            { 
                $group: { 
                    _id: null,
                    MonthlyRevenue: { $sum: "$priceDetails.subTotal" }
                }
            }
        ]);

        return result.length > 0 ? result[0].MonthlyRevenue : 0;

    } catch (error) {
        console.log("monthlyRevenue Error:",error)
    }
}

const activeUsers = async()=>{
    try {
        const activeUsersCount = await usercollection.countDocuments({isActive : true})
        return activeUsersCount
    } catch (error) {
        console.log("activeUsers Error:",error)
    }
}

const categoryRevenue = async()=>{
    try {
        const categoryRevenueData = await product.aggregate([
            {
                $match:{salesCount:{$gt:0}}
            },
            {
                $group:{
                    _id: "$productCategoryId",
                    totalProducts:{ $sum: "$salesCount" }
                }
            },
            {
                $lookup:{
                    from:"category",
                    localField:"_id",
                    foreignField:"_id",
                    as:"categoryRevenueData"
                }
            },
            {
                $project: {
                    categoryName: { $arrayElemAt: ["$categoryRevenueData.categoryName", 0] },
                    totalProducts: 1
                }
            }
        ])
        for(let i of categoryRevenueData){
            const categories = await category.findOne({_id:i._id})
            i.categoryName = categories.categoryName
        }
        let result = []
        for(let i of categoryRevenueData){
            const color = getRandomColor()
            const tem = {name: i.categoryName, value: i.totalProducts , color: color}
            result.push(tem)
        }
        return result
    } catch (error) {
        console.log("categoryRevenue Error:",error)
    }
}

const salesData = async()=>{
    try {
        const datas = await order.aggregate([
            {
                $match:{
                    status:"Delivered"
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$deliveryDate" } },
                    dailyRevenue: { $sum: "$priceDetails.subTotal" },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $limit: 14,
            },
        ]);
        const result = fillMissingRevenue(datas)
        for(let i of result){
            i.date = i._id
            i.revenue = i.dailyRevenue
        }
        return result
    } catch (error) {
        console.log("salesData Error:",error)
    }
}

module.exports = { completedOrders,ordersToShip,todayIncome,productCount,totalRevenue,monthlyRevenue,activeUsers,categoryRevenue,salesData }