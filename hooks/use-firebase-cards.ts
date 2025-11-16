import { useState, useEffect, useCallback } from "react";

export interface BusinessCard {
  id: string;
  slug: string;
  name: string;
  title: string;
  phone1: string;
  phone2?: string;
  email1: string;
  email2?: string;
  address: string;
  avatar: string;
  imageCover: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  qrCode?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Cache-Control": "no-cache",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export function useFirebaseCards() {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cards", {
        cache: "no-store",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cards");
      }

      setCards(data.cards);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCard = useCallback(
    async (cardData: Omit<BusinessCard, "id" | "slug" | "createdAt" | "updatedAt" | "userId">) => {
      try {
        const response = await fetch("/api/cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(cardData),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || data.message || data.details || "Failed to create card";
          throw new Error(errorMessage);
        }

        await fetchCards();
        return data.card;
      } catch (err) {
        throw err;
      }
    },
    [fetchCards]
  );

  const getCard = useCallback(async (identifier: string): Promise<BusinessCard> => {
    try {
      if (!identifier.match(/^[a-f\d]{24}$/i)) {
        const response = await fetch(`/api/cards/slug/${identifier}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch card");
        }

        return data.card;
      }

      const allCards = await fetch("/api/cards", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      }).then((res) => res.json());
      const card = allCards.cards?.find((c: BusinessCard) => c.id === identifier);

      if (!card) {
        throw new Error("Card not found");
      }

      return card;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to fetch card");
    }
  }, []);

  const getCardBySlug = useCallback(async (slug: string): Promise<BusinessCard> => {
    try {
      const response = await fetch(`/api/cards/slug/${slug}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch card");
      }

      return data.card;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to fetch card");
    }
  }, []);

  const updateCard = useCallback(
    async (identifier: string, cardData: Partial<BusinessCard>) => {
      try {
        let slug = identifier;

        if (identifier.match(/^[a-f\d]{24}$/i)) {
          const allCards = await fetch("/api/cards", {
            cache: "no-store",
            headers: getAuthHeaders(),
          }).then((res) => res.json());
          const card = allCards.cards?.find((c: BusinessCard) => c.id === identifier);
          if (!card) {
            throw new Error("Card not found");
          }
          slug = card.slug;
        }

        const response = await fetch(`/api/cards/slug/${slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(cardData),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || data.message || data.details || "Failed to update card";
          throw new Error(errorMessage);
        }

        await fetchCards(); // Refresh the list
        return data.card;
      } catch (err) {
        throw err;
      }
    },
    [fetchCards]
  );

  const deleteCard = useCallback(async (identifier: string) => {
    try {
      let slug = identifier;

      if (!identifier.match(/^[a-z0-9-]+$/)) {
        const allCards = await fetch("/api/cards", {
          cache: "no-store",
          headers: getAuthHeaders(),
        }).then((res) => res.json());
        const foundCard = allCards.cards?.find((c: BusinessCard) => c.id === identifier);
        if (!foundCard || !foundCard.slug) {
          throw new Error("Card not found or missing slug");
        }
        slug = foundCard.slug;
      }

      const response = await fetch(`/api/cards/slug/${slug}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete card");
      }

      setCards((prevCards) => prevCards.filter((c) => c.slug !== slug));

      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete card");
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    createCard,
    getCard,
    getCardBySlug,
    updateCard,
    deleteCard,
    refetch: fetchCards,
  };
}

export function useFirebaseCard(id: string | null) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchCard = useCallback(async (cardIdentifier: string) => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      if (!cardIdentifier.match(/^[a-f\d]{24}$/i)) {
        const response = await fetch(`/api/cards/slug/${cardIdentifier}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          } else {
            throw new Error(data.error || "Failed to fetch card");
          }
          return;
        }

        setCard(data.card);
        return;
      }

      const response = await fetch("/api/cards");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cards");
      }

      const foundCard = data.cards?.find((c: BusinessCard) => c.id === cardIdentifier);
      if (!foundCard) {
        setNotFound(true);
        return;
      }

      setCard(foundCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch card");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCard(id);
    } else {
      setLoading(false);
    }
  }, [id, fetchCard]);

  const refetch = useCallback(() => {
    if (id) {
      fetchCard(id);
    }
  }, [id, fetchCard]);

  return {
    card,
    loading,
    error,
    notFound,
    refetch,
  };
}

export function useFirebaseCardBySlug(slug: string | null) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchCard = useCallback(async (cardSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      const response = await fetch(`/api/cards/slug/${cardSlug}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
        } else {
          throw new Error(data.error || "Failed to fetch card");
        }
        return;
      }

      setCard(data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch card");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchCard(slug);
    } else {
      setLoading(false);
    }
  }, [slug, fetchCard]);

  const refetch = useCallback(() => {
    if (slug) {
      fetchCard(slug);
    }
  }, [slug, fetchCard]);

  return {
    card,
    loading,
    error,
    notFound,
    refetch,
  };
}
