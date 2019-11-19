//Budget Controller
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if (totalIncome > 0){
    this.percentage = Math.round((this.value / totalIncome) * 100);
  } else {
    this.percentage = -1;
  }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };


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
  };

  return {
    addItem: function(type, des, val) {
      var newItem, id;

      //Create new ID then create new item based on inc or exp
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }

      if (type === "exp") {
        newItem = new Expense(id, des, val);
      } else if (type === "inc") {
        newItem = new Income(id, des, val);
      }
      //Push it into our data structure
      data.allItems[type].push(newItem);

      //Return the new element
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1){
        data.allItems[type].splice(index, 1);
      }

    },
    calculateBudget: function(){
      //Calculate Total Income and Expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //Calculate Total Budget: income - expenses__list
      data.budget = data.totals.inc - data.totals.exp;
      //Calculate the percentage of income that we spent
      if (data.totals.inc > 0){
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    } else {
      data.percentage = -1;
    }
    },
    calculatePercentages: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);

      });
    },
    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };

})();

//UI Controller
var uiController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3){
      int = int.substr(0, int.length - 3 ) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];
    return (type === "exp" ? "-" : "+") + int + "." + dec;

  };

  var nodeListForEach = function(list, callback){
    for (var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either Inc or Exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type){
      var html, newHtml, element;
      //Create HTML with placeholder text
      if (type === "inc"){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    } else if (type === "exp"){
        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    }
      //Replace placeholder text with Data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //Insert HTML in the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },
    clearFields: function(){
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function(obj){
      obj.budget > 0 ? type = "inc" : type ="exp";
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percentages){
      var fields;
      fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


      nodeListForEach(fields, function(current, index){
        if (percentages[index] > 0){
        current.textContent = percentages[index] + "%";
      } else {
        current.textContent = "---";
      }
      });

    },
    displayMonth: function(){
      var now, year, month, months;
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;


    },
    changedType: function(){
      var fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue);
      nodeListForEach(fields, function(cur){
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },
    getDOMstrings: function() {
      return DOMstrings;
    },
  };

})();

//Global App Controller
var controller = (function(budgetCtrl, uiCtrl) {

  var setUpEventListeners = function() {
    var DOM = uiCtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", crtlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keycode === 13 || event.which === 13) {
        crtlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener("click", crtlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change", uiCtrl.changedType);
  };

var updateBudget = function(){
  //1. Calculate the Budget
  budgetCtrl.calculateBudget();
  //2. Return the Budget
  var budget = budgetCtrl.getBudget();
  //3. Display the budget on the UI
  uiCtrl.displayBudget(budget);
};

var updatePercentages = function(){
  //Calulate the budget updatePercentages
    budgetCtrl.calculatePercentages();
  //Read percentages from the budget Controller
    var percentages = budgetCtrl.getPercentages();
  //Update the UI with new percentages
    uiCtrl.displayPercentages(percentages);
};

  var crtlAddItem = function() {
    var input, newItem;

    //1. Get Input Data
    input = uiCtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
    //2. Add Items to budget Controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    //3. Add items to UI
    uiCtrl.addListItem(newItem, input.type);

    //4. Clear the fields
    uiCtrl.clearFields();

    //5. Calculate and Update budget
    updateBudget();

    //6. Calculate and Update percentages
    updatePercentages();
  }
  };

  var crtlDeleteItem = function(event){
    var itemID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID){
      var splitID, type, ID;
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. Delete the item from data structure
      budgetCtrl.deleteItem(type, ID);

      //2. Delete the item from the UI
      uiCtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application has started");
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1});
      setUpEventListeners();
    }
  };

})(budgetController, uiController);

controller.init();
