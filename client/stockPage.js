Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy +"-"+ (mm[1]?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]); // padding
};
Template.stock.helpers({
    "items": function(){
        var filter = {};
        if(Session.get("filters")) filter = Session.get("filters");
        filter["usedAt"]= {$exists: false};
        filter["expiredAt"] = {$exists: false};
        var items = Stock.find(filter);
        var result = {};
        var generalWeight = {};
        var generalPrice = {};
        items.forEach(function(elem){
            result[elem.name] = elem;
            generalWeight[elem.name] ? null : generalWeight[elem.name] = 0;
            generalPrice[elem.name] ? null : generalPrice[elem.name] = 0;
            if(elem.weight) generalWeight[elem.name] += elem.weight;
            var count = Stock.find({name:elem.name, usedAt:{$exists: false}, expiredAt: {$exists: false} }).count();
            result[elem.name]["amount"] = count;
            generalPrice[elem.name] += elem.pricePerUnit;
            result[elem.name]["price"] = Math.round(generalPrice[elem.name]*100)/100;
            if(elem.weight){
                result[elem.name]["weight"] = Math.round(generalWeight[elem.name]*100)/100;
                result[elem.name]["price"] = Math.round((elem.pricePerUnit * elem.weight)*100)/100;
            }
        });

        return _.map(result, function(val,key){return {name: key, value: val}});
    },
    "usedItems": function(){
        var filter = {};
        if(Session.get("filters")) filter = Session.get("filters");
        filter["usedAt"]= {$exists: true};
        return Stock.find(filter);
    },
    "expiredItems": function(){
        var filter = {};
        if(Session.get("filters")) filter = Session.get("filters");
        filter["expiredAt"] = {$exists: true};
        return Stock.find(filter);
    },
    "rawItems": function(){
        var filter = {};
        if(Session.get("filters")) filter = Session.get("filters");
        filter["usedAt"]= {$exists: false};
        filter["expiredAt"] = {$exists: false};
        return Stock.find(filter,{sort:{pricePerUnit:1}});
    },
    "editMode": function(){
        return Session.get("editMode");
    },
    "tab": function(){
        var tab = {};
        tab["fullSelected"] = Session.get("tab") == "full";
        if(Session.get("tab") == "full") {
            tab['aggr'] = "";
            tab['full'] = "active"
        }
        else {
            tab['aggr'] = "active";
            tab['full'] = ""
        }
        return tab;
    }
});
Template.stock.events({
    "click .remove": function(){
        Stock.remove(this.value._id);
    },
    "click .used": function(event){
        Stock.update(this.value._id, {$set: {usedAt: new Date().yyyymmdd()}});
        //Stock.find({}).forEach(function(elem){
        //    Object.keys(elem).forEach(function(key){
        //        if(key != "_id"){
        //            typeof(elem[key]) == 'string' ? elem[key] = elem[key].toLowerCase() : elem[key];
        //        }
        //    });
        //    Stock.update(elem._id, {$set:elem});
        //});
        //Products.find({}).forEach(function(elem){
        //    Object.keys(elem).forEach(function(key){
        //        if(key != "_id"){
        //            typeof(elem[key]) == 'string' ? elem[key] = elem[key].toLowerCase() : elem[key];
        //        }
        //    });
        //    Products.update(elem._id, {$set:elem});
        //})
    },
    "click .expired": function(event){
        Stock.update(this.value._id, {$set: {expiredAt: new Date().yyyymmdd()}});
    },
    "click ul.lists li": function(event){
        jQuery("ul.lists li").removeClass("active");
        jQuery(event.target).parent().addClass("active");
        Session.set("tab",event.target.name);
    },
    "click .removeFull": function(){
        Stock.remove(this._id);
    },
    "click .usedFull": function(event){
        Stock.update(this._id, {$set: {usedAt: new Date().yyyymmdd()}});
    },
    "click .expiredFull": function(event){
        Stock.update(this._id, {$set: {expiredAt: new Date().yyyymmdd()}});
    }
});
