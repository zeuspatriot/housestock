Template.listPage.helpers({
    "products": function(){
        return Products.find({},{sort: {like: 1}});
    },
    "stockItems": function(){
        var listItems = List.find({});
        var result = {};
        var generalWeight = {};
        listItems.forEach(function(elem){
            var items = Stock.find({name:elem.name,usedAt:{$exists: false}, expiredAt: {$exists: false} })
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
        });

        //var items = Stock.find({usedAt:{$exists: false}, expiredAt: {$exists: false}});
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
    },
    "click #addProductCancel": function(){
        jQuery(".popup").css("display","none");
        jQuery(".greyout").css("display","none");
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
    },
    "click #addProduct": function(){
        jQuery(".popup#addProduct").css("display","block");
        jQuery(".greyout").css("display","block");
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
        return currentProduct;
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
    "click .transferToStock": function(event){
        jQuery(".toStock#"+this.value._id).show();
        jQuery(".greyout").show();
    },
    "submit .approve": function(event){
        event.preventDefault();
        var product = {};
        var id = this.value._id;
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
        product["_id"] = this.value._id;
        Stock.insert(product, function(err, res){
            List.remove(id);
            jQuery(".popup").hide();
            jQuery(".greyout").hide();
        });
    },
    "click #toStockCancel":function(){
        jQuery(".popup").hide();
        jQuery(".greyout").hide();
    }
});