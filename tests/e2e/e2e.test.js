const supertest = require("supertest");
const {app} = require("../app");
const mongoose = require("mongoose");
const {insertManyUsers, deleteManyUsers} = require("../fixtures/users");
const {MongoMemoryServer} = require("mongodb-memory-server");
const fs = require("fs");
const path = require("path");
const Shop = require("../../src/models/shopModel");
const User = require("../../src/models/userModel");
const Cart = require("../../src/models/cartModel");
const Transaction = require("../../src/models/transactionModel");

describe("tests/e2e/e2e.test.js", () => {
  let token = "";
  const data = {
    username: "jesttesting",
    name: "jest",
    email: "jesttesting@gmail.com",
    password: "halobang",
    phone: "+6281111111111",
    dateOfBirth: "2001-01-01",
  };
  let mongoServer = null;

  beforeAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe("Users", () => {
    beforeEach(async () => {
      await deleteManyUsers();
      await insertManyUsers();
      await supertest(app).post("/api/users").send(data).expect(200);
      const login = await supertest(app)
        .post("/api/login")
        .send({username: data.username, password: data.password})
        .expect(200);
      token = login.body.token;
    });

    afterEach(async () => {
      await deleteManyUsers();
    });

    describe("POST /api/users -> create new user", () => {
      it("should return status code 200 and user data when user registered", async () => {
        const {username, email, ...rest} = data;
        const user = await supertest(app)
          .post("/api/users")
          .send({username: "cheems", email: "cheemsishere@gmail.com", ...rest})
          .expect(200);
        expect(user.body.new_user).toBeTruthy();
      });
      it("should return status code 400 if one or more required registration data is missing", async () => {
        await supertest(app).post("/api/users").expect(400);
        await supertest(app)
          .post("/api/users")
          .send({username: "username"})
          .expect(400);
        await supertest(app)
          .post("/api/users")
          .send({name: "myname"})
          .expect(400);
        await supertest(app)
          .post("/api/users")
          .send({email: "email@email.com"})
          .expect(400);
        await supertest(app)
          .post("/api/users")
          .send({password: "password"})
          .expect(400);
        await supertest(app)
          .post("/api/users")
          .send({phone: "+6281111111111"})
          .expect(400);
        await supertest(app)
          .post("/api/users")
          .send({dateOfBirth: "2001-01-01"})
          .expect(400);
      });
      it("should return status code 409 when username or email is already taken", async () => {
        const {username, email, ...rest} = data;
        await supertest(app)
          .post("/api/users")
          .send({username: "dimasmaulana", email, ...rest})
          .expect(409);
        await supertest(app)
          .post("/api/users")
          .send({username, email: "dev.dimas@gmail.com", ...rest})
          .expect(409);
      });
    });

    describe("GET /api/users/:id -> get user data", () => {
      it("should return status code 200 and requested user data based on id if user is the rightful owner", async () => {
        const user = await supertest(app)
          .get(`/api/users/${data.username}`)
          .set("Authorization", token)
          .expect(200);
        expect(user.body.data).toBeTruthy();
      });
      it("should return status code 401 when token correct but trying to accessing unauthorized data", async () => {
        const user = await supertest(app)
          .get("/api/users/dimasmaulana")
          .set("Authorization", token)
          .expect(401);
        expect(user.body.data).toBeFalsy();
      });
      it("should return status code 401 when header authorization not found", async () => {
        const user = await supertest(app)
          .get("/api/users/dimasmaulana")
          .expect(401);
        expect(user.body.data).toBeFalsy();
      });
    });

    describe("PUT /api/users/:id -> edit user data", () => {
      it("should return status code 200 and updated user data", async () => {
        const {username, ...rest} = data;
        const updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({username: "Cheems", ...rest})
          .set("Authorization", token)
          .expect(200);
        expect(updated_user.body.updated_user).toBeTruthy();
      });
      it("should return status code 400 if one or more required update data is missing", async () => {
        let updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({username: "Cheems"})
          .set("Authorization", token)
          .expect(400);
        expect(updated_user.body.updated_user).toBeFalsy();
        updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({name: "Cheems Everywhere"})
          .set("Authorization", token)
          .expect(400);
        expect(updated_user.body.updated_user).toBeFalsy();
        updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({email: "lookcheems@gmail.com"})
          .set("Authorization", token)
          .expect(400);
        expect(updated_user.body.updated_user).toBeFalsy();
        updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({phone: "+62899999999999"})
          .set("Authorization", token)
          .expect(400);
        expect(updated_user.body.updated_user).toBeFalsy();
        updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({dateOfBirth: "2012-12-12"})
          .set("Authorization", token)
          .expect(400);
        expect(updated_user.body.updated_user).toBeFalsy();
      });
      it("should return status code 409 when user edit username or email with the one already taken by another user", async () => {
        const {username, email, ...rest} = data;
        await supertest(app)
          .post(`/api/users`)
          .send({username: "elonmusk", email: "elonmusk@tesla.com", ...rest})
          .expect(200);
        let updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({username: "elonmusk", email, ...rest})
          .set("Authorization", token)
          .expect(409);
        expect(updated_user.body.updated_user).toBeFalsy();
        updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({email: "elonmusk@tesla.com", username, ...rest})
          .set("Authorization", token)
          .expect(409);
        expect(updated_user.body.updated_user).toBeFalsy();
      });
      it("should return status code 401 when header authorization not found", async () => {
        const updated_user = await supertest(app)
          .put(`/api/users/${data.username}`)
          .send({dateOfBirth: "2012-12-12"})
          .expect(401);
        expect(updated_user.body.updated_user).toBeFalsy();
      });
    });

    describe("DELETE /api/users/:id -> delete user", () => {
      it("should return status code 200 when user successfully deleted", async () => {
        const deleted_user = await supertest(app)
          .delete(`/api/users/${data.username}`)
          .set("Authorization", token)
          .expect(200);
        expect(deleted_user.body.message).toBe("OK!.");
      });
      it("should return status code 401 when header authorization not found", async () => {
        const deleted_user = await supertest(app)
          .delete(`/api/users/${data.username}`)
          .expect(401);
      });
    });

    describe("PUT /api/users/:id/change-password -> change user password", () => {
      it("should return status code 200 when user successfully change password", async () => {
        const user = await supertest(app)
          .put(`/api/users/${data.username}/change-password`)
          .send({password: "passwordbarunih", currentPassword: data.password})
          .set("Authorization", token)
          .expect(200);
        expect(user.body.message).toBe("Password updated!.");
      });
      it("should return status code 401 when user's new password and user's current password doesnt match", async () => {
        const user = await supertest(app)
          .put(`/api/users/${data.username}/change-password`)
          .send({
            password: "passwordbarunih",
            currentPassword: "passwordlamayangtaksesuai",
          })
          .set("Authorization", token)
          .expect(401);
      });
      it("should return status code 401 when header authorization not found", async () => {
        const user = await supertest(app)
          .put(`/api/users/${data.username}/change-password`)
          .send({
            password: "passwordbarunih",
            currentPassword: data.password,
          })
          .expect(401);
      });
    });

    describe("PUT /api/users/:id/avatar -> change user avatar", () => {
      const imageBuffer = fs.readFileSync(
        path.resolve("tests/images/images.png"),
      );
      it("should return status code 200 when user successfuly change avatar", async () => {
        const user = await supertest(app)
          .put(`/api/users/${data.username}/avatar`)
          .attach("avatar", imageBuffer, "images.png")
          .set("Authorization", token)
          .expect(200);
        await supertest(app)
          .delete(`/api/users/${data.username}/avatar`)
          .set("Authorization", token);
      });
      it("should return status code 400 when user dont send images/files", async () => {
        const user = await supertest(app)
          .put(`/api/users/${data.username}/avatar`)
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        const user = await supertest(app)
          .put(`/api/users/${data.username}/avatar`)
          .expect(401);
      });
    });

    describe("PUT /api/users/:id/address -> set user address", () => {
      it("should return status code 200 when user successfully set address", async () => {
        const user = await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({
            postalCode: 61000,
            street: "Jalan Raya Rungkut",
            subdistrict: "Rungkut Madya",
            city: "Surabaya",
            province: "Jawa Timur",
          })
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 if one or more required address data is missing", async () => {
        await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({
            street: "Jalan Raya Rungkut",
            subdistrict: "Rungkut Madya",
            city: "Surabaya",
            province: "Jawa Timur",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({
            postalCode: 61000,
            subdistrict: "Rungkut Madya",
            city: "Surabaya",
            province: "Jawa Timur",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({
            postalCode: 61000,
            street: "Jalan Raya Rungkut",
            city: "Surabaya",
            province: "Jawa Timur",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({
            postalCode: 61000,
            street: "Jalan Raya Rungkut",
            subdistrict: "Rungkut Madya",
            province: "Jawa Timur",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({
            postalCode: 61000,
            street: "Jalan Raya Rungkut",
            subdistrict: "Rungkut Madya",
            city: "Surabaya",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({})
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .put(`/api/users/${data.username}/address`)
          .send({
            postalCode: 61000,
            street: "Jalan Raya Rungkut",
            subdistrict: "Rungkut Madya",
            city: "Surabaya",
            province: "Jawa Timur",
          })
          .expect(401);
      });
    });

    describe("DELETE /api/users/:id/avatar -> delete user avatar", () => {
      const imageBuffer = fs.readFileSync(
        path.resolve("tests/images/images.png"),
      );
      it("should return status code 200 when user successfuly delete avatar", async () => {
        await supertest(app)
          .put(`/api/users/${data.username}/avatar`)
          .attach("avatar", imageBuffer, "images.png")
          .set("Authorization", token);
        await supertest(app)
          .delete(`/api/users/${data.username}/avatar`)
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .put(`/api/users/${data.username}/avatar`)
          .expect(401);
      });
    });

    describe("POST /api/users/:id/create-shop -> create shop", () => {
      it("should return status code 200 when user successfully create shop", async () => {
        await supertest(app)
          .post(`/api/users/${data.username}/create-shop`)
          .send({
            username: "tokomakmur",
            shopName: "Toko Makmur Barokah",
            phone: "+6282331122555",
          })
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 if one or more required new shop data is missing", async () => {
        await supertest(app)
          .post(`/api/users/${data.username}/create-shop`)
          .send({
            shopName: "Toko Makmur Barokah",
            phone: "+6282331122555",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .post(`/api/users/${data.username}/create-shop`)
          .send({
            username: "tokomakmur",
            phone: "+6282331122555",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .post(`/api/users/${data.username}/create-shop`)
          .send({
            username: "tokomakmur",
            shopName: "Toko Makmur Barokah",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .post(`/api/users/${data.username}/create-shop`)
          .send({})
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .post(`/api/users/${data.username}/create-shop`)
          .send({
            username: "tokomakmur",
            shopName: "Toko Makmur Barokah",
            phone: "+6282331122555",
          })
          .expect(401);
      });
    });
  });

  describe("Shops", () => {
    let shopData = {
      username: "tokomakmur",
      shopName: "Toko Makmur",
      phone: "+6289263544977",
    };
    beforeEach(async () => {
      await Shop.deleteMany({});
      await deleteManyUsers();
      await insertManyUsers();
      await supertest(app).post("/api/users").send(data).expect(200);
      const login = await supertest(app)
        .post("/api/login")
        .send({username: data.username, password: data.password})
        .expect(200);
      token = login.body.token;
      await supertest(app)
        .post(`/api/users/${data.username}/create-shop`)
        .send(shopData)
        .set("Authorization", token)
        .expect(200);
    });

    afterEach(async () => {
      await deleteManyUsers();
      await Shop.deleteMany({});
    });

    describe("PUT /api/shops/:id -> edit shop profile", () => {
      it("should return status code 200 and updated shop data", async () => {
        const updatedShop = await supertest(app)
          .put(`/api/shops/${shopData.username}`)
          .send({
            username: "majumapan",
            shopName: "Toko Makmur 5758",
            phone: "+628555555555",
          })
          .set("Authorization", token)
          .expect(200);
        expect(updatedShop.body.updated_shop).toBeTruthy();
        expect(updatedShop.body.updated_shop.username).toBe("majumapan");
        expect(updatedShop.body.updated_shop.shop_name).toBe(
          "Toko Makmur 5758",
        );
        expect(updatedShop.body.updated_shop.phone).toBe("+628555555555");
        await supertest(app)
          .delete("/api/shops/majumapan/avatar")
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 if one or more required shop data is missing", async () => {
        await supertest(app)
          .put(`/api/shops/${shopData.username}`)
          .send({
            shopName: "Toko Makmur 5758",
            phone: "+628555555555",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/shops/${shopData.username}`)
          .send({
            username: "majumapan",
            phone: "+628555555555",
          })
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/shops/${shopData.username}`)
          .send({
            username: "majumapan",
            shopName: "Toko Makmur 5758",
          })
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .put(`/api/shops/${shopData.username}`)
          .send({
            username: "majumapan",
            shopName: "Toko Makmur 5758",
            phone: "+628555555555",
          })
          .expect(401);
      });
    });

    describe("PUT /api/shops/:id/avatar -> update shop avatar", () => {
      const imageBuffer = fs.readFileSync(
        path.resolve("tests/images/images.png"),
      );
      it("should return status code 200 when shop avatar successfully updated", async () => {
        await supertest(app)
          .put(`/api/shops/${shopData.username}/avatar`)
          .attach("avatar", imageBuffer, "images.png")
          .set("Authorization", token)
          .expect(200);
        await supertest(app)
          .delete(`/api/shops/${shopData.username}/avatar`)
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 when shop avatar file is missing", async () => {
        await supertest(app)
          .put(`/api/shops/${shopData.username}/avatar`)
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .put(`/api/shops/${shopData.username}/avatar`)
          .attach("avatar", imageBuffer, "images.png")
          .expect(401);
      });
    });

    describe("DELETE /api/shops/:id/avatar -> delete shop avatar", () => {
      it("should return status code 200 when shop avatar is successfully deleted", async () => {
        await supertest(app)
          .delete(`/api/shops/${shopData.username}/avatar`)
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .delete(`/api/shops/${shopData.username}/avatar`)
          .expect(401);
      });
    });

    describe("DELETE /api/shops/:id -> delete shop", () => {
      it("should return status code 200 when shop successfully deleted", async () => {
        await supertest(app)
          .delete(`/api/shops/${shopData.username}`)
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .delete(`/api/shops/${shopData.username}`)
          .expect(401);
      });
    });

    describe("Product", () => {
      const product = {
        productName: "Coklat Silverqueen",
        description: "Coklat nikmat dengan isian kacang almond",
        price: 23000,
        quantity: 10,
      };
      let productId = "";
      const imageBuffer = fs.readFileSync(
        path.resolve("tests/images/images.png"),
      );
      beforeEach(async () => {
        const productInsert = await supertest(app)
          .post(`/api/shops/${shopData.username}/products`)
          .field("productName", product.productName)
          .field("description", product.description)
          .field("price", product.price)
          .field("quantity", product.quantity)
          .attach("image1", imageBuffer, "image1.png")
          .set("Authorization", token)
          .expect(200);
        productId = productInsert.body.newProduct._id.toString();
      });

      afterEach(async () => {
        await supertest(app)
          .delete(`/api/shops/${shopData.username}/products/${productId}`)
          .set("Authorization", token);
      });

      describe("GET /api/shops/:id/products -> get all products from specific shop", () => {
        it("should return status code 200 and get all product from specific shop", async () => {
          const allProducts = await supertest(app)
            .get(`/api/shops/${shopData.username}/products`)
            .expect(200);
          expect(allProducts.body.products.length > 0);
        });
        it("should return status code 404 when shop is not found", async () => {
          const allProducts = await supertest(app)
            .get(`/api/shops/tokogapernahada/products`)
            .expect(404);
          expect(allProducts.body.products).toBeFalsy();
        });
      });

      describe("GET /api/shops/:id/products/:productId -> get one specific products from specific shop", () => {
        it("should return status code 200 and get one specific product from specific shop", async () => {
          const oneProduct = await supertest(app)
            .get(`/api/shops/${shopData.username}/products/${productId}`)
            .expect(200);
          expect(oneProduct.body.product).toBeTruthy();
        });
        it("should return status code 404 when shop or product is not found", async () => {
          const oneProduct = await supertest(app)
            .get(`/api/shops/tokogapernahada/products/${productId}`)
            .expect(404);
          await supertest(app)
            .get(`/api/shops/${shopData.username}/products/productghaib`)
            .expect(404);
          expect(oneProduct.body.product).toBeFalsy();
        });
      });

      describe("POST /api/shops/:id/products -> add product", () => {
        it("should return status code 200 when product successfully added", async () => {
          const productInsert = await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .field("productName", product.productName)
            .field("description", product.description)
            .field("price", product.price)
            .field("quantity", product.quantity)
            .attach("image1", imageBuffer, "image1.png")
            .set("Authorization", token)
            .expect(200);
          expect(productInsert.body.newProduct).toBeTruthy();
          await supertest(app)
            .delete(
              `/api/shops/${
                shopData.username
              }/products/${productInsert.body.newProduct._id.toString()}`,
            )
            .set("Authorization", token);
        });
        it("should return status code 400 if one or more required product data is missing", async () => {
          const productInsert = await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .field("description", product.description)
            .field("price", product.price)
            .field("quantity", product.quantity)
            .attach("image1", imageBuffer, "image1.png")
            .set("Authorization", token)
            .expect(400);
          expect(productInsert.body.newProduct).toBeFalsy();
          await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .field("productName", product.productName)
            .field("price", product.price)
            .field("quantity", product.quantity)
            .attach("image1", imageBuffer, "image1.png")
            .set("Authorization", token)
            .expect(400);
          await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .field("productName", product.productName)
            .field("quantity", product.quantity)
            .attach("image1", imageBuffer, "image1.png")
            .set("Authorization", token)
            .expect(400);
          await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .field("productName", product.productName)
            .field("price", product.price)
            .attach("image1", imageBuffer, "image1.png")
            .set("Authorization", token)
            .expect(400);
          await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .field("productName", product.productName)
            .field("price", product.price)
            .field("quantity", product.quantity)
            .set("Authorization", token)
            .expect(400);
          await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .set("Authorization", token)
            .expect(400);
        });
        it("should return status code 401 when header authorization not found", async () => {
          await supertest(app)
            .post(`/api/shops/${shopData.username}/products`)
            .field("productName", product.productName)
            .field("description", product.description)
            .field("price", product.price)
            .field("quantity", product.quantity)
            .attach("image1", imageBuffer, "image1.png")
            .expect(401);
        });
      });

      describe("PUT /api/shops/:id/products/:productId -> edit product", () => {
        it("should return status code 200 when product successfully updated", async () => {
          const updatedProduct = await supertest(app)
            .put(`/api/shops/${shopData.username}/products/${productId}`)
            .field("productName", "Coklat mahal")
            .field("description", "Coklat ini harganya mahal")
            .field("price", 24000)
            .field("quantity", 100)
            .attach("images1", imageBuffer, "images.png")
            .set("Authorization", token)
            .expect(200);
          expect(updatedProduct.body.updatedProduct.product_name).toBe(
            "Coklat mahal",
          );
          expect(updatedProduct.body.updatedProduct.description).toBe(
            "Coklat ini harganya mahal",
          );
          expect(updatedProduct.body.updatedProduct.price).toBe("24000");
          expect(updatedProduct.body.updatedProduct.quantity).toBe("100");
        });
        it("should return status code 400 if one or more updated product data is missing", async () => {
          const updatedProduct = await supertest(app)
            .put(`/api/shops/${shopData.username}/products/${productId}`)
            .field("description", "Coklat ini harganya mahal")
            .field("price", 24000)
            .field("quantity", 100)
            .attach("images1", imageBuffer, "images.png")
            .set("Authorization", token)
            .expect(400);
          expect(updatedProduct.body.updatedProduct).toBeFalsy();
          await supertest(app)
            .put(`/api/shops/${shopData.username}/products/${productId}`)
            .field("productName", "Coklat mahal")
            .field("price", 24000)
            .field("quantity", 100)
            .attach("images1", imageBuffer, "images.png")
            .set("Authorization", token)
            .expect(400);
          await supertest(app)
            .put(`/api/shops/${shopData.username}/products/${productId}`)
            .field("productName", "Coklat mahal")
            .field("description", "Coklat ini harganya mahal")
            .field("quantity", 100)
            .attach("images1", imageBuffer, "images.png")
            .set("Authorization", token)
            .expect(400);
          await supertest(app)
            .put(`/api/shops/${shopData.username}/products/${productId}`)
            .field("productName", "Coklat mahal")
            .field("description", "Coklat ini harganya mahal")
            .field("price", 24000)
            .attach("images1", imageBuffer, "images.png")
            .set("Authorization", token)
            .expect(400);
          await supertest(app)
            .put(`/api/shops/${shopData.username}/products/${productId}`)
            .set("Authorization", token)
            .expect(400);
        });
        it("should return status code 401 when header authorization not found", async () => {
          await supertest(app)
            .put(`/api/shops/${shopData.username}/products/${productId}`)
            .field("productName", "Coklat mahal")
            .field("description", "Coklat ini harganya mahal")
            .field("price", 24000)
            .field("quantity", 100)
            .attach("images1", imageBuffer, "images.png")
            .expect(401);
        });
      });

      describe("DELETE /api/shops/:id/products/:productId -> delete product", () => {
        it("should return status code 200 when product successfully deleted", async () => {
          await supertest(app)
            .delete(`/api/shops/${shopData.username}/products/${productId}`)
            .set("Authorization", token)
            .expect(200);
        });
        it("should return status code 401 when header authorization not found", async () => {
          await supertest(app)
            .delete(`/api/shops/${shopData.username}/products/${productId}`)
            .expect(401);
        });
      });
    });
  });

  describe("Cart", () => {
    let shopData = {
      username: "tokomakmur",
      shopName: "Toko Makmur",
      phone: "+6289263544977",
    };
    const product = {
      productName: "Coklat Silverqueen",
      description: "Coklat nikmat dengan isian kacang almond",
      price: 23000,
      quantity: 10,
    };
    const userDemoCart = {
      username: "cheemseverywhere",
      name: "Cheems",
      email: "cheems@gmail.com",
      password: "halobang",
      phone: "+6289090909090",
      dateOfBirth: "2001-01-01",
    };
    let productId = "";
    const imageBuffer = fs.readFileSync(
      path.resolve("tests/images/images.png"),
    );
    beforeEach(async () => {
      await supertest(app).post("/api/users").send(data).expect(200);
      const login = await supertest(app)
        .post("/api/login")
        .send({username: data.username, password: data.password})
        .expect(200);
      token = login.body.token;
      await supertest(app)
        .post(`/api/users/${data.username}/create-shop`)
        .send(shopData)
        .set("Authorization", token)
        .expect(200);
      const productInsert = await supertest(app)
        .post(`/api/shops/${shopData.username}/products`)
        .field("productName", product.productName)
        .field("description", product.description)
        .field("price", product.price)
        .field("quantity", product.quantity)
        .attach("image1", imageBuffer, "image1.png")
        .set("Authorization", token)
        .expect(200);
      productId = productInsert.body.newProduct._id.toString();
      await supertest(app).post("/api/users").send(userDemoCart).expect(200);
      const loginCartDemo = await supertest(app)
        .post("/api/login")
        .send({
          username: userDemoCart.username,
          password: userDemoCart.password,
        })
        .expect(200);
      token = loginCartDemo.body.token;
      await supertest(app)
        .put(`/api/users/${userDemoCart.username}/address`)
        .send({
          postalCode: 61600,
          street: "Jalan Mana Saja",
          subdistrict: "Kecamatan Warna",
          city: "Kota Atlantis",
          province: "Jawa Timur",
        })
        .set("Authorization", token)
        .expect(200);
      const cart = await supertest(app)
        .post(`/api/carts/${userDemoCart.username}/product/${productId}`)
        .set("Authorization", token)
        .expect(200);
      expect(cart.body.inserted_cart).toBeTruthy();
    });
    afterEach(async () => {
      await supertest(app)
        .delete(`/api/users/${userDemoCart.username}`)
        .set("Authorization", token)
        .expect(200);
      const login = await supertest(app)
        .post("/api/login")
        .send({username: data.username, password: data.password})
        .expect(200);
      token = login.body.token;
      await supertest(app)
        .delete(`/api/shops/${shopData.username}/products/${productId}`)
        .set("Authorization", token);
      await supertest(app)
        .delete(`/api/users/${data.username}`)
        .set("Authorization", token)
        .expect(200);
      await User.deleteMany({});
      await Shop.deleteMany({});
      await Cart.deleteMany({});
    });

    describe(`GET /api/carts/:id -> get all products from user's cart`, () => {
      it(`should return status code 200 and user's cart`, async () => {
        const cart = await supertest(app)
          .get(`/api/carts/${userDemoCart.username}`)
          .set("Authorization", token)
          .expect(200);
        expect(cart.body.carts).toBeTruthy();
      });
      it("should return status code 401 when header authorization not found", async () => {
        const cart = await supertest(app)
          .get(`/api/carts/${userDemoCart.username}`)
          .expect(401);
        expect(cart.body.carts).toBeFalsy();
      });
    });

    describe(`POST /api/carts/:id/product/:productId -> add product to user's cart`, () => {
      it("should return status code 200 when user successfully insert product to cart", async () => {
        const cart = await supertest(app)
          .post(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .set("Authorization", token)
          .expect(200);
        expect(cart.body.inserted_cart).toBeTruthy();
      });
      it("should return status code 401 when header authorization not found", async () => {
        const cart = await supertest(app)
          .post(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .expect(401);
        expect(cart.body.inserted_cart).toBeFalsy();
      });
    });

    describe(`PUT /api/carts/:id/product/:productId -> edit product quantity from user's cart`, () => {
      it("should return status code 200 when user successfully edit product quantity from cart", async () => {
        await supertest(app)
          .put(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .send({quantity: 5})
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 when quantity request data is missing", async () => {
        await supertest(app)
          .put(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 400 when user quantity request exceeds product available stock", async () => {
        await supertest(app)
          .put(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .send({quantity: 10000})
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .put(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .send({quantity: 10000})
          .expect(401);
      });
    });

    describe(`DELETE /api/carts/:id/product/:productId -> delete product from user's cart`, () => {
      it("should return 200 when product successfully deleted from cart", async () => {
        await supertest(app)
          .delete(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .delete(`/api/carts/${userDemoCart.username}/product/${productId}`)
          .expect(401);
      });
      it("should return 404 when product not found in the cart", async () => {
        await supertest(app)
          .delete(`/api/carts/${userDemoCart.username}/product/produkghaib`)
          .set("Authorization", token)
          .expect(404);
      });
    });

    describe(`POST /api/carts/:id/checkout/product/:productId -> delete product from user's cart`, () => {
      it("should return status code 200 when user successfully checkout product from cart", async () => {
        await supertest(app)
          .post(
            `/api/carts/${userDemoCart.username}/checkout/product/${productId}`,
          )
          .send({payAmount: 23000})
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 if payAmount request body not found", async () => {
        await supertest(app)
          .post(
            `/api/carts/${userDemoCart.username}/checkout/product/${productId}`,
          )
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .post(
            `/api/carts/${userDemoCart.username}/checkout/product/${productId}`,
          )
          .send({payAmount: 23000})
          .expect(401);
      });
      it("should return status code 402 when payAmount request body is not match with product price", async () => {
        await supertest(app)
          .post(
            `/api/carts/${userDemoCart.username}/checkout/product/${productId}`,
          )
          .send({payAmount: 3000})
          .set("Authorization", token)
          .expect(402);
      });
      it("should return status code 404 when product not found in the cart", async () => {
        await supertest(app)
          .post(
            `/api/carts/${userDemoCart.username}/checkout/product/produkghaib`,
          )
          .send({payAmount: 3000})
          .set("Authorization", token)
          .expect(404);
      });
    });
  });

  describe("Transaction", () => {
    let shopData = {
      username: "tokomakmur",
      shopName: "Toko Makmur",
      phone: "+6289263544977",
    };
    const product = {
      productName: "Coklat Silverqueen",
      description: "Coklat nikmat dengan isian kacang almond",
      price: 23000,
      quantity: 10,
    };
    const userDemoTransaction = {
      username: "cheemseverywhere",
      name: "Cheems",
      email: "cheems@gmail.com",
      password: "halobang",
      phone: "+6289090909090",
      dateOfBirth: "2001-01-01",
    };
    let productId = "";
    let transactionId = "";
    const imageBuffer = fs.readFileSync(
      path.resolve("tests/images/images.png"),
    );
    beforeEach(async () => {
      await supertest(app).post("/api/users").send(data).expect(200);
      const login = await supertest(app)
        .post("/api/login")
        .send({username: data.username, password: data.password})
        .expect(200);
      token = login.body.token;
      await supertest(app)
        .post(`/api/users/${data.username}/create-shop`)
        .send(shopData)
        .set("Authorization", token)
        .expect(200);
      const productInsert = await supertest(app)
        .post(`/api/shops/${shopData.username}/products`)
        .field("productName", product.productName)
        .field("description", product.description)
        .field("price", product.price)
        .field("quantity", product.quantity)
        .attach("image1", imageBuffer, "image1.png")
        .set("Authorization", token)
        .expect(200);
      productId = productInsert.body.newProduct._id.toString();
      await supertest(app)
        .post("/api/users")
        .send(userDemoTransaction)
        .expect(200);
      const loginCartDemo = await supertest(app)
        .post("/api/login")
        .send({
          username: userDemoTransaction.username,
          password: userDemoTransaction.password,
        })
        .expect(200);
      token = loginCartDemo.body.token;
      await supertest(app)
        .put(`/api/users/${userDemoTransaction.username}/address`)
        .send({
          postalCode: 61600,
          street: "Jalan Mana Saja",
          subdistrict: "Kecamatan Warna",
          city: "Kota Atlantis",
          province: "Jawa Timur",
        })
        .set("Authorization", token)
        .expect(200);
      const newTransaction = await supertest(app)
        .post("/api/transactions")
        .send({
          id: userDemoTransaction.username,
          productId,
          quantity: 1,
          payAmount: product.price,
        })
        .set("Authorization", token)
        .expect(200);
      transactionId = newTransaction.body.new_transaction._id.toString();
    });
    afterEach(async () => {
      const loginUser = await supertest(app)
        .post("/api/login")
        .send({
          username: userDemoTransaction.username,
          password: userDemoTransaction.password,
        })
        .expect(200);
      token = loginUser.body.token;
      await supertest(app)
        .delete(`/api/users/${userDemoTransaction.username}`)
        .set("Authorization", token)
        .expect(200);
      const loginSeller = await supertest(app)
        .post("/api/login")
        .send({username: data.username, password: data.password})
        .expect(200);
      token = loginSeller.body.token;
      await supertest(app)
        .delete(`/api/shops/${shopData.username}/products/${productId}`)
        .set("Authorization", token);
      await supertest(app)
        .delete(`/api/users/${data.username}`)
        .set("Authorization", token)
        .expect(200);
      await User.deleteMany({});
      await Shop.deleteMany({});
      await Cart.deleteMany({});
      await Transaction.deleteMany({});
    });

    describe("GET /api/transactions/user/:id -> get all user's transaction", () => {
      it("should return status code 200 and get all transactions", async () => {
        const transaction = await supertest(app)
          .get(`/api/transactions/user/${userDemoTransaction.username}`)
          .set("Authorization", token)
          .expect(200);
        expect(transaction.body.transactions).toBeTruthy();
      });
      it("should return status code 401 when header authorization not found", async () => {
        const transaction = await supertest(app)
          .get(`/api/transactions/user/${userDemoTransaction.username}`)
          .expect(401);
        expect(transaction.body.transactions).toBeFalsy();
      });
    });

    describe("POST /api/transactions -> create a new transaction", () => {
      it("should return status code 200 when user successfully create transaction", async () => {
        await supertest(app)
          .post("/api/transactions")
          .send({
            id: userDemoTransaction.username,
            productId,
            quantity: 1,
            payAmount: product.price,
          })
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 if one or more required field is not found", async () => {
        await supertest(app)
          .post("/api/transactions")
          .send({
            id: userDemoTransaction.username,
            productId,
            payAmount: product.price,
          })
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .post("/api/transactions")
          .send({
            id: userDemoTransaction.username,
            productId,
            quantity: 1,
            payAmount: product.price,
          })
          .expect(401);
      });
      it("should return status code 402 when payAmount request body is not match with product price", async () => {
        await supertest(app)
          .post("/api/transactions")
          .send({
            id: userDemoTransaction.username,
            productId,
            quantity: 1,
            payAmount: 1000,
          })
          .set("Authorization", token)
          .expect(402);
      });
      it("should return status code 404 when product not found", async () => {
        await supertest(app)
          .post("/api/transactions")
          .send({
            id: userDemoTransaction.username,
            productId: "productghaib",
            quantity: 1,
            payAmount: product.price,
          })
          .set("Authorization", token)
          .expect(404);
      });
    });

    describe("PUT /api/transactions/:transactionId/user/:id -> buyer set transaction as done/completed", () => {
      it("should return status code 200 when buyer successfully set transaction as done/completed", async () => {
        const sellerLogin = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = sellerLogin.body.token;
        await supertest(app)
          .put(`/api/transactions/${transactionId}/shop/${shopData.username}`)
          .set("Authorization", token)
          .expect(200);
        const userLogin = await supertest(app)
          .post("/api/login")
          .send({
            username: userDemoTransaction.username,
            password: userDemoTransaction.password,
          })
          .expect(200);
        token = userLogin.body.token;
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/user/${userDemoTransaction.username}`,
          )
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 when transaction status is on shipping or already completed", async () => {
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/user/${userDemoTransaction.username}`,
          )
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization is not found", async () => {
        const sellerLogin = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = sellerLogin.body.token;
        await supertest(app)
          .put(`/api/transactions/${transactionId}/shop/${shopData.username}`)
          .set("Authorization", token)
          .expect(200);
        const userLogin = await supertest(app)
          .post("/api/login")
          .send({
            username: userDemoTransaction.username,
            password: userDemoTransaction.password,
          })
          .expect(200);
        token = userLogin.body.token;
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/user/${userDemoTransaction.username}`,
          )
          .expect(401);
      });
      it("should return status code 404 when transaction not found", async () => {
        await supertest(app)
          .put(
            `/api/transactions/transaksighaib/user/${userDemoTransaction.username}`,
          )
          .set("Authorization", token)
          .expect(404);
      });
    });

    describe("PUT /api/transactions/:transactionId/user/:id/cancelled -> buyer set cancelled transaction", () => {
      it("should return status code 200 when buyer successfully cancelled transaction", async () => {
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/user/${userDemoTransaction.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 when buyer try to cancelling transaction that have status shipping or already cancelled", async () => {
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/user/${userDemoTransaction.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(200);
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/user/${userDemoTransaction.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization is not found", async () => {
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/user/${userDemoTransaction.username}/cancelled`,
          )
          .expect(401);
      });
      it("should return status code 404 when transaction is not found", async () => {
        await supertest(app)
          .put(
            `/api/transactions/transaksighaib/user/${userDemoTransaction.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(404);
      });
    });

    describe("PUT /api/transactions/:transactionId/shop/:id -> seller set transaction shipped", () => {
      it("should return status code 200 when seller successfully set transaction as shipped", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(`/api/transactions/${transactionId}/shop/${shopData.username}`)
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 when transaction is already shipped or already completed", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(`/api/transactions/${transactionId}/shop/${shopData.username}`)
          .set("Authorization", token)
          .expect(200);
        await supertest(app)
          .put(`/api/transactions/${transactionId}/shop/${shopData.username}`)
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization is not found", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(`/api/transactions/${transactionId}/shop/${shopData.username}`)
          .expect(401);
      });
      it("should return status code 404 when transaction is not found", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(`/api/transactions/transaksighaib/shop/${shopData.username}`)
          .set("Authorization", token)
          .expect(404);
      });
    });

    describe("PUT /api/transactions/:transactionId/shop/:id/cancelled -> seller cancelled transaction", () => {
      it("should return status code 200 when seller successfully cancelled transaction", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/shop/${shopData.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 when transaction is already completed or already cancelled", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/shop/${shopData.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(200);
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/shop/${shopData.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization is not found", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(
            `/api/transactions/${transactionId}/shop/${shopData.username}/cancelled`,
          )
          .expect(401);
      });
      it("should return status code 404 when transaction is not found", async () => {
        const loginSeller = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        token = loginSeller.body.token;
        await supertest(app)
          .put(
            `/api/transactions/transaksighaib/shop/${shopData.username}/cancelled`,
          )
          .set("Authorization", token)
          .expect(404);
      });
    });
  });

  describe("Review", () => {
    let shopData = {
      username: "tokomakmur",
      shopName: "Toko Makmur",
      phone: "+6289263544977",
    };
    const product = {
      productName: "Coklat Silverqueen",
      description: "Coklat nikmat dengan isian kacang almond",
      price: 23000,
      quantity: 10,
    };
    const userDemoReview = {
      username: "cheemseverywhere",
      name: "Cheems",
      email: "cheems@gmail.com",
      password: "halobang",
      phone: "+6289090909090",
      dateOfBirth: "2001-01-01",
    };
    let productId = "";
    let transactionId = "";
    const imageBuffer = fs.readFileSync(
      path.resolve("tests/images/images.png"),
    );
    const loginSeller = async () => {
      const login = await supertest(app)
        .post("/api/login")
        .send({
          username: data.username,
          password: data.password,
        })
        .expect(200);
      token = login.body.token;
    };
    const loginUser = async () => {
      const login = await supertest(app)
        .post("/api/login")
        .send({
          username: userDemoReview.username,
          password: userDemoReview.password,
        })
        .expect(200);
      token = login.body.token;
    };
    const postReview = async () => {
      await supertest(app)
        .post(`/api/review/${transactionId}/user/${userDemoReview.username}`)
        .send({rating: 5, comment: "Ratingnya 5 karena bagus"})
        .set("Authorization", token)
        .expect(200);
    };

    beforeEach(async () => {
      await supertest(app).post("/api/users").send(data).expect(200);
      await loginSeller();
      await supertest(app)
        .post(`/api/users/${data.username}/create-shop`)
        .send(shopData)
        .set("Authorization", token)
        .expect(200);
      const productInsert = await supertest(app)
        .post(`/api/shops/${shopData.username}/products`)
        .field("productName", product.productName)
        .field("description", product.description)
        .field("price", product.price)
        .field("quantity", product.quantity)
        .attach("image1", imageBuffer, "image1.png")
        .set("Authorization", token)
        .expect(200);
      productId = productInsert.body.newProduct._id.toString();
      await supertest(app).post("/api/users").send(userDemoReview).expect(200);
      await loginUser();
      await supertest(app)
        .put(`/api/users/${userDemoReview.username}/address`)
        .send({
          postalCode: 61600,
          street: "Jalan Mana Saja",
          subdistrict: "Kecamatan Warna",
          city: "Kota Atlantis",
          province: "Jawa Timur",
        })
        .set("Authorization", token)
        .expect(200);
      const newTransaction = await supertest(app)
        .post("/api/transactions")
        .send({
          id: userDemoReview.username,
          productId,
          quantity: 1,
          payAmount: product.price,
        })
        .set("Authorization", token)
        .expect(200);
      transactionId = newTransaction.body.new_transaction._id.toString();
      await loginSeller();
      await supertest(app)
        .put(`/api/transactions/${transactionId}/shop/${shopData.username}`)
        .set("Authorization", token)
        .expect(200);
      await loginUser();
      await supertest(app)
        .put(
          `/api/transactions/${transactionId}/user/${userDemoReview.username}`,
        )
        .set("Authorization", token)
        .expect(200);
    });
    afterEach(async () => {
      const loginUser = await supertest(app)
        .post("/api/login")
        .send({
          username: userDemoReview.username,
          password: userDemoReview.password,
        })
        .expect(200);
      token = loginUser.body.token;
      await supertest(app)
        .delete(`/api/users/${userDemoReview.username}`)
        .set("Authorization", token)
        .expect(200);
      const loginSeller = await supertest(app)
        .post("/api/login")
        .send({username: data.username, password: data.password})
        .expect(200);
      token = loginSeller.body.token;
      await supertest(app)
        .delete(`/api/shops/${shopData.username}/products/${productId}`)
        .set("Authorization", token);
      await supertest(app)
        .delete(`/api/users/${data.username}`)
        .set("Authorization", token)
        .expect(200);
      await User.deleteMany({});
      await Shop.deleteMany({});
      await Cart.deleteMany({});
      await Transaction.deleteMany({});
    });

    describe(`POST /api/review/:transactionId/user/:id -> user give review`, () => {
      it("should return status code 200 when user successfully give review", async () => {
        await postReview();
      });
      it("should return status code 400 when required body request is missing", async () => {
        await supertest(app)
          .post(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({comment: "Ratingnya 5 karena bagus"})
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .post(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({rating: 5})
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .post(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 400 when transaction has already given review", async () => {
        await postReview();
        await supertest(app)
          .post(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({rating: 5, comment: "Ratingnya 5 karena bagus"})
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await supertest(app)
          .post(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({rating: 5, comment: "Ratingnya 5 karena bagus"})
          .expect(401);
      });
      it("should return status code 404 when transaction is not found", async () => {
        await supertest(app)
          .post(`/api/review/transaksighaib/user/${userDemoReview.username}`)
          .send({rating: 5, comment: "Ratingnya 5 karena bagus"})
          .set("Authorization", token)
          .expect(404);
      });
    });

    describe("PUT /api/review/:transactionId/user/:id -> user edit review", () => {
      it("should return status code 200 when user successfully edit review", async () => {
        await postReview();
        await supertest(app)
          .put(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({rating: 3, comment: "Baru dipakai 5 menit sudah rusak"})
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 400 when required body request is missing", async () => {
        await postReview();
        await supertest(app)
          .put(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({comment: "Baru dipakai 5 menit sudah rusak"})
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({rating: 3})
          .set("Authorization", token)
          .expect(400);
        await supertest(app)
          .put(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .set("Authorization", token)
          .expect(400);
      });
      it("should return status code 401 when header authorization not found", async () => {
        await postReview();
        await supertest(app)
          .put(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({rating: 3, comment: "Baru dipakai 5 menit sudah rusak"})
          .expect(401);
      });
      it("should return status code 404 when transaction is not found", async () => {
        await postReview();
        await supertest(app)
          .put(`/api/review/transaksighaib/user/${userDemoReview.username}`)
          .send({rating: 3, comment: "Baru dipakai 5 menit sudah rusak"})
          .set("Authorization", token)
          .expect(404);
      });
      it("should return status code 404 when previous review not found", async () => {
        await postReview();
        const newTransaction = await supertest(app)
          .post("/api/transactions")
          .send({
            id: userDemoReview.username,
            productId,
            quantity: 1,
            payAmount: product.price,
          })
          .set("Authorization", token)
          .expect(200);
        transactionId = newTransaction.body.new_transaction._id.toString();
        await supertest(app)
          .put(`/api/review/${transactionId}/user/${userDemoReview.username}`)
          .send({rating: 3, comment: "Baru dipakai 5 menit sudah rusak"})
          .set("Authorization", token)
          .expect(404);
      });
    });

    describe("DELETE /api/review/:transactionId/user/:id -> user delete review", () => {
      it("should return status code 200 when user successfully deleted review", async () => {
        await postReview();
        await supertest(app)
          .delete(
            `/api/review/${transactionId}/user/${userDemoReview.username}`,
          )
          .set("Authorization", token)
          .expect(200);
      });
      it("should return status code 401 when header authorization is not found", async () => {
        await postReview();
        await supertest(app)
          .delete(
            `/api/review/${transactionId}/user/${userDemoReview.username}`,
          )
          .expect(401);
      });
      it("should return status code 404 when transaction is not found", async () => {
        await postReview();
        await supertest(app)
          .delete(`/api/review/transaksighaib/user/${userDemoReview.username}`)
          .set("Authorization", token)
          .expect(404);
      });
    });
  });

  describe("Login", () => {
    beforeEach(async () => {
      await deleteManyUsers();
      await insertManyUsers();
      await supertest(app).post("/api/users").send(data).expect(200);
    });

    afterEach(async () => {
      await deleteManyUsers();
    });

    describe("POST /api/login -> get user logged in", () => {
      it("should return status code 200 when user successfully logged in", async () => {
        const login = await supertest(app)
          .post("/api/login")
          .send({username: data.username, password: data.password})
          .expect(200);
        expect(login.body.token).toBeTruthy();
      });
      it("should return status code 400 if one or more required login data is missing", async () => {
        await supertest(app)
          .post("/api/login")
          .send({username: data.username})
          .expect(400);
        await supertest(app)
          .post("/api/login")
          .send({password: data.password})
          .expect(400);
        const login = await supertest(app)
          .post("/api/login")
          .send({})
          .expect(400);
        expect(login.body.token).toBeFalsy();
      });
      it("should return status code 403 when user input invalid credentials", async () => {
        await supertest(app)
          .post("/api/login")
          .send({
            username: data.username,
            password: "passwordyangsudahjelassalah",
          })
          .expect(403);
        const login = await supertest(app)
          .post("/api/login")
          .send({username: "usernamengasal", password: data.password})
          .expect(403);
        expect(login.body.token).toBeFalsy();
      });
    });
  });

  describe("Not Found Routes", () => {
    it("should return status code 404 and error message", async () => {
      const res = await supertest(app).get("/non-existent-routes");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        message: "Not found!.",
        status: 404,
        error: true,
      });
    });
  });
});
