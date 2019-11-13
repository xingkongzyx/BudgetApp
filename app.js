var budgetController = (function() {

    //选择创造constructors是因为未来会有很多Expense或者Income入账
    var Expense = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }


    Expense.prototype.caclPerOfExp = function(totalIncome){
        if(totalIncome > 0)
        {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else
        {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPerOfExp = function(){
        return this.percentage;
    }

    var Income = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    //Helper function to caculate the sum value of exp and inc
    var caculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(currentVal){
            sum += currentVal.value;
        });

        data.totals[type] = sum;
    }

    //The data structure created to record all expenses, incomes
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        //The function to add a new item to our data structure, after that, we can add it to our interface
        //Will fair this function in controlAddItem() function
        addItem: function(type, description, value){
            //Because we will create our new item using above constructors, so we need an id
            //The value of the new item's id will be the value of last item's id in the array plus 1            
            var lenOfData = data.allItems[type].length;
            var ID;
            if(lenOfData !== 0)
            {
                ID = data.allItems[type][lenOfData-1].id+1;
            }
            else
            {
                ID = 0;
            }
            //The new item which will inserted to data
            var newItem;        
            
            if(type === "exp")
            {
                newItem = new Expense(ID,description,value);
            }
            else if(type === "inc")
            {
                newItem = new Income(ID,description,value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        caculateBudget: function(){
            //cacualte total income and expenses
            caculateTotal("exp");
            caculateTotal("inc");

            //caculate the budget 
            data.budget = data.totals.inc - data.totals.exp;


            //caculate the percentage of income that we spent
            //If total income is 0, we can not measure percentage because divisor can not be 0
            if(data.totals.inc > 0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else
            {
                data.percentage = -1;
            } 
        },

        //The function to caculate the percentage of each expense object by using the built-in
        //methog caclPerOfExp of expense object 
        cacualtePercentage: function(){
            data.allItems.exp.forEach(function(currentEle){
                currentEle.caclPerOfExp(data.totals.inc);
            })
        },

        //上面的方程已经计算了percentage这个方程去获取这些expenses object的percentage
        getPercentage: function(){
            var allpersArr;
            allpersArr =  data.allItems.exp.map(function(currentEle){
                return currentEle.getPerOfExp();
            });
            return allpersArr;
        },

        //return an object including everything item about the budget
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        deleteItem: function(type,id){
            var idArr;

            //use map function to return an array containing all ids in that specific type array
            idArr = data.allItems[type].map(function(ele){
                return ele.id;
            })
            //try to find the index of the item id you want to delete
            var indexOfSpecificItem = idArr.indexOf(id);

            //If we can find it(not equal to 1), delete using splice method
            if(indexOfSpecificItem !== -1)
            {
                data.allItems[type].splice(indexOfSpecificItem,1);
            }
        },

        testing: function(){
            console.log(data);
        }
    }


})()

var UIController = (function(){
    
    //contain all selectors that easy to use
    //Pass it to other controller
    var DOMstrings = {
        addType: ".add__type",
        addDescription: ".add__description",
        addValue: ".add__value",
        addBtn: ".add__btn",
        incomeList: ".income__list",
        expenseList: ".expenses__list",
        budgetVal: ".budget__value",
        totalIncome: ".budget__income--value",
        totalExpense: ".budget__expenses--value",
        budgetPercentage: ".budget__expenses--percentage",
        containerOfItems: ".container",
        expensePer: ".item__percentage",
        dateLabel: ".budget__title--month"
    }

    //The for each function we create by ourself
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++)
        {
            callback(list[i],i);
        }
    };


    //The method is used to format the numbers in the UI
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        //Let number always has two decimal digits, return a string
        num = num.toFixed(2);

        //split it into two strings "2310" and "46"
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        //add the + or - symbol
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };


 

    return {
        //This function is used to get all info from the input
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.addType).value,
                description: document.querySelector(DOMstrings.addDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.addValue).value)
            }
        },

        //This function is used to pass DOMStrings to other controller
        getDOMstrings: function(){
            return DOMstrings;
        },

        addListItem: function(newItemObj, type){
            var htmlCode;
            var insertedEle;
            //create the default html code that will be inserted as new item
            if(type === "exp")
            {
                htmlCode = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                insertedEle = document.querySelector(DOMstrings.expenseList);
            }
            else if(type === "inc")
            {
                htmlCode = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                insertedEle = document.querySelector(DOMstrings.incomeList);
            }

            //replace the default code with values in new item object
            var newHtmlCode = htmlCode.replace("%des%",newItemObj.description);
            newHtmlCode = newHtmlCode.replace("%id%",newItemObj.id);
            //format the each item in budget
            newHtmlCode = newHtmlCode.replace("%val%",formatNumber(newItemObj.value,type));

            //Insert the new html code into html file using insertAdjacentHTML()
            //parses the specified text as HTML or XML and inserts the resulting nodes into the DOM tree at a specified position. It does not reparse the element it is being used on.

            //using beforeend to insert new item to the end of the list every time
            insertedEle.insertAdjacentHTML("beforeend",newHtmlCode);
        },
        //每次输入完毕后清理那片input区域
        clearFields: function(){
            var fields, fieldArr;
            //return a node list, need to converted to array first
            //This example returns a list of all elements within the document with a class of either addDescription or addValue:
            fields = document.querySelectorAll(DOMstrings.addDescription + ", " + DOMstrings.addValue);

            //convert fields to array
            fieldArr = Array.prototype.slice.call(fields);
            //loop through it and clear it
            fieldArr.forEach(function(ele) {
                ele.value = "";
            });

            fieldArr[0].focus();
        },

        //delete the budget from the UI
        deleteListItem: function(ItemID){
            var childEle = document.getElementById(ItemID);

            //不能直接delete element, 只能delete child element, 所以先找parent然后移除child
            childEle.parentNode.removeChild(childEle);

        },

        //The function to change the "budget" "income" "expense" and "percentage" in UI
        /*
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        */
        displayBudget: function(budgetObj){

            //format the budget
            var type;
            budgetObj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetVal).textContent = formatNumber(budgetObj.budget,type);
            document.querySelector(DOMstrings.totalIncome).textContent = formatNumber(budgetObj.totalInc,'inc');
            document.querySelector(DOMstrings.totalExpense).textContent = formatNumber(budgetObj.totalExp,'exp');

            if(budgetObj.percentage > 0)
            {
                document.querySelector(DOMstrings.budgetPercentage).textContent = budgetObj.percentage + "%";
            }
            else
            {
                document.querySelector(DOMstrings.budgetPercentage).textContent = "---";
            }

        },

        //This method is used to display percentage on the ui
        displayPercentage: function(allpersArr){
            
            var nodeList = document.querySelectorAll(DOMstrings.expensePer);

            nodeListForEach(nodeList, function(currentEle, index){
                
                if(allpersArr[index] > 0)
                {
                    currentEle.textContent = allpersArr[index] + "%";
                }
                else
                {
                    currentEle.textContent = "---";
                }
                
            });
        

        },

        //Used to display the montha and year in the header of UI
        displayMonth: function(){
            var months = ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"];

            var date = new Date;
            var year = date.getFullYear();
            //Will return the 0 based index refers to a month such as april will be 3
            var monthIndex = date.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = year + " " + months[monthIndex];
        },

        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.addType + ',' +
                DOMstrings.addDescription + ',' +
                DOMstrings.addValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.addBtn).classList.toggle('red');
            
        },
    }

})()


//全局部署区域,这个IIFE会调动前两个IIFE
var appController = (function(){
    
    var setupEventListeners = function(){
        var DOMstrings = UIController.getDOMstrings();

        //The event handling when clicking the button
        //当添加正常方程时就不需要controlAddItem()的括号了
        document.querySelector(DOMstrings.addBtn).addEventListener("click", controlAddItem);

        //The event handles when user press "enter" will have same effect as clicking the button
        document.addEventListener("keypress", function(pressEvent){
            //To make sure the event happens only when user press "enter"
            if(pressEvent.keyCode === 13 || pressEvent.which === 13)
            {
                controlAddItem();
            }
        })

        //The first step in deleting an item using event delegation
        //提取他们的common parent然后bubble up
        document.querySelector(DOMstrings.containerOfItems).addEventListener("click", controlDelItem);
        //When choosing minus will triger this event
        document.querySelector(DOMstrings.addType).addEventListener("change", UIController.changedType);

    }

    //The function to caculete the budget and change the corresponding value in interface
    var updateBudget = function(){
        //1. Caculate the budget
        budgetController.caculateBudget();
        //2. return the budget
        var budgetObj = budgetController.getBudget();
        //3. Display the budget on the UI
        UIController.displayBudget(budgetObj);
        // console.log(budget);
    }

    var updatePercentage = function(){
        // 1.caculate the percentage
        budgetController.cacualtePercentage();
        // 2.get the percentage array
        var perArr = budgetController.getPercentage();
        // 3.update the percentage on the UI
        UIController.displayPercentage(perArr);
    }

    //用于控制从表格中读取的信息,以便后面的方程调用
    var controlAddItem = function(){
        
        //1. Get the field input data
        var input = UIController.getInput();
        var newItem;

        //控制输入的validation,只有当description不为空且value是个数字且大于0的情况下才能进行下一步
        if(input.description !== "" && input.value > 0 && !isNaN(input.value))
        {
            //2. Add the item to the budgetController
            newItem = budgetController.addItem(input.type,input.description,input.value);

            //3. Add the item to the UI
            UIController.addListItem(newItem,input.type);

            //4. clear the fields
            UIController.clearFields();

            //5. caculate and update budget
            updateBudget();

            //6. caculate and update the percentages
            updatePercentage();
        } 
    } 

    //The function is used to delete item, the event wil be passed as parameter
    //using event bubbling and delegation
    var controlDelItem = function(event){
        
        //只有点击删除按钮才会有下面获取id的语句
        //点击<i class="ion-ios-close-outline"></i>的四个parent node就是
        //<div class="item clearfix" id="income-1">；然后提取id
        var itemType;
        var ID;
        //The target event property returns the element that triggered the event.
        //Then traverse the dom until <div class="item clearfix" id="income-1">
        var ItemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //只有itemID存在才会有下面提取type和ID的语句
        if(ItemID)
        {
            itemType = ItemID.split("-")[0];
            ID = parseInt(ItemID.split("-")[1]);
            //1.delete the element from the data structure
            budgetController.deleteItem(itemType,ID);
            //2.delete item from the ui
            UIController.deleteListItem(ItemID);

            //3.update budget and corresponding ui
            updateBudget();

            //4.caculate and update the percentages
            updatePercentage();
        }

        
        
    }

    return {
        //把所有想要执行的方程放到这里，通过外部调用执行
        init: function(){
            console.log("APP STARTED");
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

    


})()

//The only function needed to start the app 
appController.init();

