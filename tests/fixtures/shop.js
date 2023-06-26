const Shop = require("../../src/models/shopModel");
const shops = [
  {
    _id: "6491ed95820aa4ccd6cd9717",
    username: "medalstore",
    shop_name: "Medal Store",
    phone: "+6285718127688",
    shop_avatar: null,
    isVerified: false,
    products: [
      {
        product_name: "Coklat Silverqueen",
        description: "Coklat nikmat dengan isian kacang almond",
        price: 20000,
        quantity: 10,
        images: ["/products/6491fe8d65164fcaafeb65a2/0.jpg"],
        rating: null,
        _id: "6491fe8d65164fcaafeb65a2",
        reviews: [],
      },
    ],
    createdAt: "2023-06-20T18:19:01.582Z",
    updatedAt: "2023-06-20T19:31:25.716Z",
  },
  {
    _id: "649205110b0870758d452f84",
    username: "tokomessi",
    shop_name: "Messi The Goat",
    phone: "+6285718127688",
    shop_avatar: null,
    isVerified: false,
    products: [
      {
        product_name: "Donat JCo",
        description: "Donat untuk menemani waktu kumpul bersama keluarga",
        price: 26000,
        quantity: 17,
        images: ["/products/649205650b0870758d452f89/0.jpg"],
        rating: 5,
        reviews: [
          {
            rating: 5,
            comment: "Pembelian pertama. Enak banget!.",
            userId: "64858348573224b9dda87431",
            transactionId: "6496c6ee427a1712284255d3",
            _id: "64970a55527e641b6a66119b",
          },
        ],
        _id: "649205650b0870758d452f89",
      },
    ],
    createdAt: "2023-06-20T19:59:13.059Z",
    updatedAt: "2023-06-24T16:41:02.204Z",
  },
];

const insertManyShops = async () => {
  await Shop.insertMany(shops);
};

const deleteManyShops = async () => {
  await Shop.deleteMany({});
};

module.exports = {
  shops,
  insertManyShops,
  deleteManyShops,
};
