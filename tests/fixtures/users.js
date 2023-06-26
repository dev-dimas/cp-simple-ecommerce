const User = require("../../src/models/userModel");
const users = [
  {
    _id: "64858348573224b9dda87431",
    username: "dimasmaulana",
    name: "Dimas Maulana",
    email: "dev.dimas@gmail.com",
    password: "$2b$10$KsjTtIumcAY7h1rzOi3EXOwPv2Xha8nXxh8.fkReFrkjyEegKcTU2",
    address: {
      street: null,
      subdistrict: null,
      city: null,
      province: null,
      postalCode: null,
    },
    phone: "+6285718127688",
    dateOfBirth: "2001-10-30T00:00:00.000Z",
    avatar: null,
    shop: "medalstore",
    cart: [],
    transaction: [],
    createdAt: "2023-06-11T08:18:16.356Z",
    updatedAt: "2023-06-11T13:46:47.825Z",
  },
  {
    _id: "64900a73fc0aa98392e96085",
    username: "inidimas",
    name: "Dimas Maulana",
    email: "dimasmail@gmail.com",
    password: "$2b$10$dTXz9G56p.MxU3E2zUHP8OZNy4HwGCC5ntGpfhDCymPWBnXTsomSS",
    address: {
      street: null,
      subdistrict: null,
      city: null,
      province: null,
      postalCode: null,
    },
    phone: "+6285718127688",
    dateOfBirth: "2001-10-30T00:00:00.000Z",
    avatar: null,
    shop: null,
    cart: [],
    transaction: [],
    createdAt: "2023-06-19T07:57:39.711Z",
    updatedAt: "2023-06-19T07:57:39.711Z",
  },
];

const insertManyUsers = async () => {
  await User.insertMany(users);
};

const deleteManyUsers = async () => {
  await User.deleteMany({});
};

module.exports = {
  users,
  insertManyUsers,
  deleteManyUsers,
};
