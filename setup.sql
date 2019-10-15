create table drink_preference(
    id integer primary key,
    user_id integer not null,
    size text,
    type text,
    details text
);

create table shop_preference(
    id integer primary key,
    user_id integer not null,
    name text not null,
    location text
);

create table `order`(
    id integer primary key,
    date text,
    coffee_getter integer not null
);

create table user_order(
    user_id integer not null,
    order_id integer not null,
    response integer default 0,
    foreign key(order_id) references `order`(id)
);