Template.listPage.helpers({
    "products": function(){
        return Products.find({},{sort: {like: 1}});
    },
    "stockItems": function(){
        var items = Stock.find({usedAt:{$exists: false}, expiredAt: {$exists: false}});
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
    "total": function(){
        var listItems = List.find({});
        var total = 0;
        listItems.forEach(function(item){
            if(item.hasWeight){
                total += item.pricePerUnit * item.weight;
            }
            else{
                total += item.pricePerUnit;
            }
        });
        return total.toFixed(2);
    }
});
Template.listPage.events({
    "click #addToStock": function(){
        var listId = jQuery("#listId").text();
        var items = List.findOne(listId).items;
        for (item in items){
            var item = items[item];

        }
    }
});
Template.addListItems.events({
    "change #productToAdd": function(event){
        var product = Products.findOne(event.target.value);
        return Session.set("currProduct", product);
    },
    "submit .addToList": function(event){
        event.preventDefault();
        var productId = jQuery("#productToAdd").val();
        var product = Products.findOne(productId);
        delete product["_id"];
        var amount = jQuery("input#amount").val()*1;
        if (product.hasWeight){
            product['weight'] = amount;
            amount = 1;
        }

        for (var i = 0; i<amount; i++){
            List.insert(product, function(error, result){});
        }
        jQuery("input#amount").val("");
    }
});
Template.addListItems.helpers({
    "products": function(){
        return Products.find({},{sort:{ like: -1, name: 1}})
    },
    "currProduct": function(){
        var currentProduct = Session.get("currProduct")
            ? Session.get("currProduct")
            : Products.findOne(jQuery("#productToAdd").val());
        delete currentProduct['_id'];
        return _.map(currentProduct, function(val,key){return {name: key, value: val}});
        //return currentProduct;
    }
});
Template.listItems.helpers({
    "items": function(){
        var items = List.find({},{sort:{category:1}});
        var result = {};
        //console.log(items);
        var generalWeight = {};
        items.forEach(function(elem){
            var disliked = Products.find({name: elem.name, like:false},{brand:1});
            var dislikedBrands = [];
            disliked.forEach(function(item){
               dislikedBrands.push(item.brand);
            });
            result[elem.name] = elem;
            result[elem.name]["dislikedBrands"] = dislikedBrands;
            generalWeight[elem.name] ? null : generalWeight[elem.name] = 0;
            if(elem.hasWeight) generalWeight[elem.name] += elem.weight;
            var count = List.find({name:elem.name}).count();
            result[elem.name]["amount"] = count;
            result[elem.name]["price"] = (elem.pricePerUnit * count).toFixed(2);
            if(elem.hasWeight){
                result[elem.name]["weight"] = generalWeight[elem.name];
                result[elem.name]["price"] = (elem.pricePerUnit * elem.weight).toFixed(2);
            }
        });
        return _.map(result, function(val,key){return {name: key, value: val}});
    }
});
Template.listItems.events({
    "click .remove": function(){
        List.remove(this.value._id);
    },
    "click .transferToStock": function(){
        var item = List.findOne(this.value._id);
        item["boughtAt"] = new Date();
        Stock.insert(item, function(err, res){
            List.remove(item._id);
        });
    }
});