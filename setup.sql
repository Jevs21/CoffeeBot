create table if not exists drink_preference(
    id integer primary key,
    user_id integer not null,
    size text,
    type text,
    details text
);

create table  if not exists shop_preference(
    id integer primary key,
    user_id integer not null,
    name text not null,
    location text
);

create table  if not exists `order`(
    id integer primary key,
    date text,
    coffee_getter integer not null
);

create table  if not exists user_order(
    user_id integer not null,
    order_id integer not null,
    response integer default 0,
    foreign key(order_id) references `order`(id)
);