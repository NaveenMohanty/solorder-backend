const { cloudinary } = require('../db');
const Model = require('../db/model');

exports.getRestaurantById = async (req, res, next, id) => {
  let restaurant = await Model.Restaurant.findOne({ where: { restaurant_id: id } })
  if (restaurant && restaurant.dataValues) {
    req['restaurant'] = restaurant.dataValues
    next();
  } else {
    throw { error: true, msg: "Restaurant not found.", status: 400 }
  }
};

exports.getCategoryById = async (req, res, next, id) => {
  let category = await Model.MenuCategory.findOne({ where: { category_id: id } })
  if (category && category.dataValues) {
    req['category'] = category.dataValues
    next();
  } else {
    throw { error: true, msg: "category not found.", status: 400 }
  }
};

exports.UpdateRestaurant = async (req, res, next) => {
  let { body, user, restaurant } = req
  body = body ? body : {}
  user = user ? user : {}
  restaurant = restaurant ? restaurant : {}

  let { user_id, restaurant_id } = user
  let { user_id: resUserId } = restaurant

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  }

  let allowedKey = new Set(["name", "state", "city", "pincode", "latitude", "longitude", "deliveryRange", "deliveryTime", "costForTwo", "galaryImgs", "purchaseDate", "daysToExpire", "stepCompleted", "cuisines", "isActive", "rating", "plan_id"]);

  let restaurantDataBody = {}

  if (body && Object.keys(body).length) {
    Object.keys(body).forEach((key) => {
      if (allowedKey.has(key)) restaurantDataBody[key] = body[key];
    })
  }

  await Model.Restaurant.update({ ...restaurantDataBody }, {
    where: {
      restaurant_id
    }
  });

  res.json({
    error: false,
    msg: "Restaurant details updated successfully.",
  })
};

exports.getRestaurantDetails = async (req, res, next) => {
  let { user, restaurant } = req
  user = user ? user : {}
  restaurant = restaurant ? restaurant : {}

  let { user_id } = user
  let { user_id: resUserId } = restaurant

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  }

  let allowedKey = new Set(["name", "state", "city", "pincode", "latitude", "longitude", "deliveryRange", "deliveryTime", "costForTwo", "galaryImgs", "purchaseDate", "daysToExpire", "stepCompleted", "cuisines", "isActive", "rating", "plan_id"]);

  let restaurantData = {}

  if (restaurant && Object.keys(restaurant).length) {
    Object.keys(restaurant).forEach((key) => {
      if (allowedKey.has(key)) restaurantData[key] = restaurant[key];
    })
  }

  res.json({
    error: false,
    msg: "Restaurant details displayed successfully.",
    data: restaurantData
  })
};

exports.updateCategoryDetails = async (req, res, next) => {
  let { user, restaurant, query, body } = req
  user = user ? user : {}
  restaurant = restaurant ? restaurant : {}
  body = body ? body : {}

  let { user_id } = user
  let { user_id: resUserId, restaurant_id } = restaurant
  let { category_id, isNew } = query
  let { name } = body

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  }

  if (category_id) {
    let category = await Model.MenuCategory.findOne({ where: { category_id } });
    if (category && category.dataValues) {category = category.dataValues}
    let { restaurant_id: resrestaurantId } = category
    if (resrestaurantId === restaurant_id) {
      await Model.MenuCategory.update({ name }, {
        where: {
          category_id,
        }
      });
      res.json({
        error: false,
        msg: "Category Updated successfully.",
      })
    } else {
      throw { error: true, msg: "Unauthorized Category.", status: 400 }
    }
  } else if (isNew) {
    await Model.MenuCategory.create({
      name,
      restaurant_id,
    });
    res.json({
      error: false,
      msg: "Category created successfully.",
    })
  }
};

exports.deleteCategory = async (req, res, next) => {
  let { user, restaurant, query } = req
  user = user ? user : {}
  restaurant = restaurant ? restaurant : {}

  let { user_id } = user
  let { user_id: resUserId, restaurant_id } = restaurant
  let { category_id } = query

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  }

  await Model.MenuCategory.destroy({ where: { category_id, restaurant_id } });
  res.json({
    error: false,
    msg: "Category deleted successfully.",
  })
};

exports.updateItemDetails = async (req, res, next) => {
  let { user, restaurant, query, body, category } = req
  user = user ? user : {}
  restaurant = restaurant ? restaurant : {}
  body = body ? body : {}
  category = category ? category : {}

  let { user_id } = user
  let { user_id: resUserId, restaurant_id } = restaurant
  let { item_id, isNew } = query
  let { name, description, price, isVeg } = body
  let { restaurant_id: catRestaurantId, category_id } = category

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  } else if (restaurant_id !== catRestaurantId) {
    throw { error: true, msg: "Unauthorized category.", status: 400 }
  }

  if (item_id) {
    let item = await Model.MenuItem.findOne({ where: { item_id } });
    if (item && item.dataValues) { item = item.dataValues }
    let { category_id: itemCategoryId } = item
    if (itemCategoryId === category_id) {
      await Model.MenuItem.update({ name, description: description || null, price, isVeg, category_id }, {
        where: {
          item_id,
        }
      });
      res.json({
        error: false,
        msg: "Item Update successfully.",
      })
    } else {
      throw { error: true, msg: "Unauthorized Item.", status: 400 }
    }
  } else if (isNew) {
    await Model.MenuItem.create({ name, description: description || null, price, isVeg, category_id });
    res.json({
      error: false,
      msg: "Item created successfully.",
    })
  }
};

exports.deleteItem = async (req, res, next) => {
  let { user, restaurant, query, category } = req
  user = user ? user : {}
  restaurant = restaurant ? restaurant : {}
  category = category ? category : {}

  let { user_id } = user
  let { user_id: resUserId, restaurant_id } = restaurant
  let { restaurant_id: catRestaurantId, category_id } = category
  let { item_id } = query

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  } else if (restaurant_id !== catRestaurantId) {
    throw { error: true, msg: "Unauthorized category.", status: 400 }
  }

  await Model.MenuItem.destroy({ where: { category_id, item_id } });
  res.json({
    error: false,
    msg: "Category deleted successfully.",
  })
};

exports.getMenu = async (req, res, next) => {
  let { user } = req
  user = user ? user : {}

  let { restaurant_id } = user

  const result = await Model.MenuCategory.findAll({
    where: { restaurant_id },
    attributes: ['category_id', 'name']
  });

  let menu = result?.length ? result.map(async (cat) => {
    let category = cat && cat.dataValues || {}
    let item = await Model.MenuItem.findAll({
      where: { category_id: category && category.category_id || null },
      attributes: ['item_id', 'name', 'description', 'price', 'isVeg', 'rating', 'category_id']
    });
    item = item?.length ? item.map((item) => {
      return item?.dataValues || {}
    }) : []
    return { ...category, items: item };
  }) : []

  let data = await Promise.all(menu)

  res.json({
    error: false,
    msg: "Menu displayed successfully.",
    data
  })
}

exports.restaurantImage = async (req, res, next) => {
  let { formData: { files: { img } }, restaurant, user } = req
  restaurant = restaurant ? restaurant : {}
  user = user ? user : {}
  let { galaryImgs, restaurant_id, user_id } = restaurant
  let { user_id: resUserId } = user

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  }

  let imageFile = null
  if (img && Array.isArray(img)) {
    imageFile = img[0]
    if (imageFile && (imageFile.size > (2 * 1024 * 1024))) {
      throw { error: true, msg: "Image size should be less then 2Mb", status: 400 }
    } else if (imageFile && imageFile.originalFilename && !(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(imageFile.originalFilename))) {
      throw { error: true, msg: "Please upload valid image file.", status: 400 }
    } else if (imageFile && !imageFile.path) {
      throw { error: true, msg: "Something wrong with the file.", status: 400 }
    }
  } else {
    throw { error: true, msg: "Something wrong with the file.", status: 400 }
  }
  // Upload image to cloudinary
  const result = await cloudinary.uploader.upload(imageFile.path);

  let { secure_url, public_id } = result
  galaryImgs = galaryImgs && Array.isArray(galaryImgs) && galaryImgs.length ? [...galaryImgs, { restaurant_id, url: secure_url ? secure_url : null, imgId: public_id ? public_id : null, isDefaultImg: false, originalFilename: imageFile?.originalFilename || null }] : [{ restaurant_id, url: secure_url ? secure_url : null, imgId: public_id ? public_id : null, isDefaultImg: true, originalFilename: imageFile?.originalFilename || null }];
  let data = galaryImgs && Array.isArray(galaryImgs) && galaryImgs.length ? { restaurant_id, url: secure_url ? secure_url : null, imgId: public_id ? public_id : null, isDefaultImg: false, originalFilename: imageFile?.originalFilename || null } : { restaurant_id, url: secure_url ? secure_url : null, imgId: public_id ? public_id : null, isDefaultImg: true, originalFilename: imageFile?.originalFilename || null };
  await Model.Restaurant.update({ galaryImgs }, {
    where: {
      restaurant_id
    }
  });

  res.json({
    error: false,
    msg: "Image Uploaded Successfully.",
    data: data
  })
}

exports.defaultImage = async (req, res, next) => {
  let { restaurant, user, body } = req
  restaurant = restaurant ? restaurant : {}
  user = user ? user : {}
  body = body ? body : {}
  let { galaryImgs, restaurant_id, user_id } = restaurant
  let { user_id: resUserId } = user
  let { imgId } = body

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  }
  let foundImgId = galaryImgs && Array.isArray(galaryImgs) && galaryImgs.length ? galaryImgs.some((imgDetails) => (imgDetails?.imgId === imgId)) : false;
  let data = {}
  if (foundImgId)
    galaryImgs = galaryImgs.map((imgDetails) => {
      if (imgDetails?.imgId === imgId) {
        data = { ...imgDetails, isDefaultImg: true }
        return { ...imgDetails, isDefaultImg: true }
      } else {
        return { ...imgDetails, isDefaultImg: false }
      }
    })
  else
    throw { error: true, msg: "Image not found.", status: 400 }

  await Model.Restaurant.update({ galaryImgs }, {
    where: {
      restaurant_id
    }
  });

  res.json({
    error: false,
    msg: "Image Updated Successfully.",
    data: data
  })
}

exports.deleteImage = async (req, res, next) => {
  let { restaurant, user, params } = req
  restaurant = restaurant ? restaurant : {}
  user = user ? user : {}
  params = params ? params : {}
  let { galaryImgs, restaurant_id, user_id } = restaurant
  let { user_id: resUserId } = user
  let { imgId } = params

  if (user_id !== resUserId) {
    throw { error: true, msg: "Unauthorized restaurant.", status: 400 }
  }

  let foundImg = galaryImgs && Array.isArray(galaryImgs) && galaryImgs.length ? galaryImgs.find((imgDetails) => (imgDetails?.imgId === imgId)) : false;
  foundImg = foundImg ? foundImg : false

  if (foundImg && !foundImg?.isDefaultImg && imgId) {
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(imgId);
    galaryImgs = galaryImgs.filter((imgDetails) => (imgDetails?.imgId !== imgId))
  } else if (foundImg?.isDefaultImg)
    throw { error: true, msg: "Cannot delete default image.", status: 400 }
  else
    throw { error: true, msg: "Image not found.", status: 400 }

  await Model.Restaurant.update({ galaryImgs }, {
    where: {
      restaurant_id
    }
  });

  res.json({
    error: false,
    msg: "Image deleted Successfully.",
    data: imgId
  })
}