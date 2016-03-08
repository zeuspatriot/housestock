function getDistinctClasses(collection,key) {
    if(!Session.get("filters")) Session.set("filters",{});
    var filters = Session.get("filters");
    console.log(filters);
    var data = collection.find(filters).fetch();
    console.log(data);
    var distinctData = _.uniq(data, false, function(d) {return d[key]});
    return _.pluck(distinctData, key);
}
Template.filters.helpers({
    "products": function(){
        var filters = Session.get("filters");
        return Stock.find(filters);
    },
    "stockShops": function(){
        return getDistinctClasses(Stock,"shop");
    },
    "stockNames": function(){
        return getDistinctClasses(Stock,"name");
    },
    "stockBrands": function(){
        return getDistinctClasses(Stock,"brand");
    },
    "stockCategories": function(){
        return getDistinctClasses(Stock,"category");
    },
    "filters": function(){
        var filters = Session.get("filters");
        return _.map(filters, function(val,key){return {name: key, value: val}});
    }
});

Template.filters.events({
    "change .filters select": function(event){
        if(!Session.get("filters")) Session.set("filters",{});
        var filter = Session.get("filters");
        filter[event.target.name] = event.target.value;
        if(event.target.value == "none") delete filter[event.target.name];
        Session.set("filters", filter);
    },
    "change .filters .filterDateFrom": function(event){
        if(!Session.get("filters")) Session.set("filters",{});
        var filter = Session.get("filters");
        if(!filter[event.target.name]) filter[event.target.name]= {};
        if(event.target.value){
            filter[event.target.name]["$gt"]= new Date(event.target.value);
        }
        else {
            //delete filter[event.target.name]["$gt"];
        }
        Session.set("filters", filter);
    },
    "change .filters .filterDateTill": function(event){
        if(!Session.get("filters")) Session.set("filters",{});
        var filter = Session.get("filters");
        if(!filter[event.target.name]) filter[event.target.name]= {};
        if(event.target.value){
            filter[event.target.name]["$lt"] = new Date(event.target.value);
        }
        else{
            delete filter[event.target.name]["$lt"];
        }
        Session.set("filters", filter);
    },
    "click #clearFilters": function(){
        Session.set("filters",{});
    }
});