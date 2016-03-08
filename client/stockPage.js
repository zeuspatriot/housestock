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
        items.forEach(function(elem){
            result[elem.name] = elem;
            generalWeight[elem.name] ? null : generalWeight[elem.name] = 0;
            if(elem.hasWeight) generalWeight[elem.name] += elem.weight;
            var count = Stock.find({name:elem.name, usedAt:{$exists: false}, expiredAt: {$exists: false} }).count();
            result[elem.name]["amount"] = count;
            result[elem.name]["price"] = elem.pricePerUnit * count;
            if(elem.hasWeight){
                result[elem.name]["weight"] = generalWeight[elem.name];
                result[elem.name]["price"] = elem.pricePerUnit * elem.weight;
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
        return Stock.find(filter);
    },
    "editMode": function(){
        return Session.get("editMode");
    }
});
Template.stock.events({
    "click .remove": function(){
        Stock.remove(this.value._id);
    },
    "click .used": function(event){
        Stock.update(this.value._id, {$set: {usedAt: new Date().yyyymmdd()}});
    },
    "click .expired": function(event){
        Stock.update(this.value._id, {$set: {expiredAt: new Date().yyyymmdd()}});
    }
});
