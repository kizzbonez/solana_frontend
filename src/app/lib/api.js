//  API functions that can be used for guest users
//  API functions for auth user can be found in context/auth.js

export const getProductsByIds = async (ids) => {
  try {
    if (!ids) {
      console.warn("[ids] Requied field missing.");
      return;
    }
    const uniqueIds = [...new Set(ids)];
    const query = uniqueIds.map((id) => `product_ids=${id}`).join("&");
    return await fetch(`/api/es/products-by-ids?${query}`);
  } catch (err) {
    console.warn("[unsubscribe] API error:", err);
  }
};

export const getReviewsByProductId = async (product_id) => {
  try {
    return await fetch(`/api/reviews/list?product_id=${product_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.warn("[productReviewList] API error:", err);
  }
};

export const sendAbandonedCart = async (cart) => {
  try {
    if (!cart) {
      console.warn("[ABANDONED CART] No valid cart to send");
      return;
    }

    return await fetch("/api/abandoned-carts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cart),
    });
  } catch (err) {
    console.warn("[ABANDONED CART] API error:", err);
  }
};

export const subscribe = async (email) => {
  try {
    if (!email) {
      console.warn("[email] Requied field missing.");
      return;
    }

    return await fetch("/api/subscribers/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    console.warn("[subscribe] API error:", err);
  }
};

export const unsubscribe = async (email) => {
  try {
    if (!email) {
      console.warn("[email] Requied field missing.");
      return;
    }

    return await fetch("/api/subscribers/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    console.warn("[unsubscribe] API error:", err);
  }
};

// redis
export const redisGet = async (key) => {
  try {
    if (!key) {
      console.warn("[key] Requied field missing.");
      return;
    }

    return await fetch(`/api/redis/?key=${key}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.warn("[REDUS GET] API error:", err);
  }
};

export const redisSet = async ({ key, value }) => {
  try {
    if (!key || !value) {
      console.warn("[key, value] Requied field missing.");
      return;
    }

    return await fetch("/api/redis/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, value }),
    });
  } catch (err) {
    console.warn("[REDIS SET] API error:", err);
  }
};

// Token validation for store admin access
export const validateToken = async (token) => {
  try {
    if (!token) {
      console.warn("[TOKEN] Required field missing.");
      return {
        success: false,
        error: "Token is required",
      };
    }

    const response = await fetch("/api/stores/validate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response?.ok) {
      return {
        success: false,
        error: data.error || "Token validation failed",
      };
    }

    return {
      success: true,
      valid: data.valid,
      storeId: data.store_id,
      storeName: data.store_name,
      storeDomain: data.store_domain,
    };
  } catch (err) {
    console.warn("[TOKEN VALIDATION] API error:", err);
    return {
      success: false,
      error: "Token validation failed due to network error",
    };
  }
};

export const getProductsByCollectionId = async (collection_id) => {
  try {
    return await fetch(
      `/api/collections/collection-products/${collection_id}?limit=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.warn("[getProductsByCollectionId] API error:", err);
    return {
      success: false,
      error: "getProductsByCollectionId Error",
    };
  }
};
