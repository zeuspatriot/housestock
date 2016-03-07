function buildFilter(){
    var filter = {};

    return filter
}

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
    "click .editMode": function(){
        var val = Session.get("editMode");
        Session.set("editMode",!val);
    },
    "click .used": function(event){
        var itemId = jQuery(event.target).attr("id");
        Stock.update(itemId, {$set: {usedAt: new Date()}});
        Stock.update(itemId, {$set: {usedAtStr: new Date().toDateString()}});
    },
    "click .expired": function(event){
        var itemId = jQuery(event.target).attr("id");
        Stock.update(itemId, {$set: {expiredAt: new Date()}});
        Stock.update(itemId, {$set: {expiredAtStr: new Date().toDateString()}});
    },
    "submit .editProduct": function(event){
        event.preventDefault();
        var product = {};
        console.log(this);
        jQuery(event.target).find('input').each(function(){
            var field = jQuery(this);
            var name = field.attr("name");
            var value = field.val();
            if (field.attr("type") == "checkbox"){
                value = field[0].checked;
            }
            if (field.attr("type") == "number"){
                value = value * 1;
            }
            product[name] = value;
        });
        Stock.update(this._id, {$set: product});
    }
});
