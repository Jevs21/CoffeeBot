create table if not exists drink_preference(
    id integer primary key,
    user_id integer not null,
    size text,
    type text,
    details text,
    created_at datetime default CURRENT_TIMESTAMP
);

create table  if not exists shop_preference(
    id integer primary key,
    user_id integer not null,
    name text not null,
    location text,
    created_at datetime default CURRENT_TIMESTAMP
);

create table  if not exists `order`(
    id integer primary key,
    date datetime default CURRENT_TIMESTAMP,
    thread_id text not null,
    channel_id text not null,
    coffee_getter integer not null,
    status integer default 0
);

create table  if not exists user_order(
    user_id integer not null,
    order_id integer not null,
    response integer default 0,
    foreign key(order_id) references `order`(id)
);

create table if not exists test_user(
    user_name text,
    user_id text
);