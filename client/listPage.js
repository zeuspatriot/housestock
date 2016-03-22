function stockPromiseInsert (product){
    return new Promise(function(resolve, reject){
        Stock.insert(product, function(err,res){
            resolve(this);
        })
    })
}

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
                if(elem.weight) generalWeight[elem.name] += elem.weight;
                var count = Stock.find({name:elem.name, usedAt:{$exists: false}, expiredAt: {$exists: false} }).count();
                result[elem.name]["amount"] = count;
                if(elem.weight){
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
            if(item.weight){
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
        var product = {
            likedBrands: [],
            dislikedBrands: []
        };
        jQuery(event.target).find('td input').each(function(){
            var field = jQuery(this);
            var name = field.attr("name");
            var value = field.val();
            if (field.attr("type") == "number"){
                value = value * 1;
            }
            product[name] = typeof(value) == 'string' ? value.toLowerCase() : value;
        });
        if(jQuery("th input#weight")[0].checked){
            product["weight"] = product.amount;
            product["amount"] = 1;
        }
        //console.log(event.target.name.value);
        var disliked = Products.find({name: event.target.name.value.toLowerCase()});
        disliked.forEach(function(item){
            item.like ?
                product.likedBrands.push(item.brand) :
                product.dislikedBrands.push(item.brand);
        });

        List.insert(product, function(error, result){});

        jQuery(event.target).find('input').val("");
        jQuery("th input#weight").attr("checked",false);
        jQuery("form.addToList button#catName span#text").text("Категория");
        jQuery("form.addToList div.dropdown").show();
        jQuery("form.addToList input#category").hide();
    },
    "click #addProduct": function(){
        jQuery(".popup#addProduct").css("display","block");
        jQuery(".greyout").css("display","block");
    },
    "click .cat": function(event){
        jQuery("form.addToList input#category").val(event.target.text);
        jQuery("form.addToList button#catName span#text").text(event.target.text);
    },
    "click #addAnother": function(){
        jQuery("form.addToList input#category").show();
        jQuery("form.addToList div.dropdown").hide();
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
    },
    "categories": function(){
        var items = Stock.find({});
        var listitems = List.find({});
        var result = {};
        items.forEach(function(item){
            result[item.category] = true;
        });
        listitems.forEach(function(item){
            result[item.category] = true;
        });
        return Object.keys(result);
    }
});
Template.listItems.helpers({
    "items": function(){
        var items = List.find({});
        return items;
    }
});
Template.listItems.events({
    "click .remove": function(){
        List.remove(this._id);
    },
    "click .transferToStock": function(event){
        jQuery(".toStock#"+this._id).show();
        jQuery(".greyout").show();
    },
    "submit .transferToStockSubmit": function(event){
        event.preventDefault();
        var product = this;
        var id = this._id;
        delete product._id;
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
        product["boughtAt"] = new Date().yyyymmdd();
        for (var i= 0; i<product.amount;i++){
            stockPromiseInsert(product)
                .then(function(){
                    List.remove(id);
                    var equalProduct = Products.find(
                        {
                            name: product.name,
                            brand: product.brand,
                            shop: product.shop,
                            units: product.units
                        });
                    if(equalProduct.count() === 0){
                        Products.insert(product);
                    }
                    else{
                        Products.update(equalProduct.fetch()[0]._id,{$set:product});
                    }
                });

            jQuery(".popup").hide();
            jQuery(".greyout").hide();
            jQuery(".popup .toStock #"+id).remove();
        }
    },
    "click #toStockCancel":function(){
        jQuery(".popup").hide();
        jQuery(".greyout").hide();
    }
});