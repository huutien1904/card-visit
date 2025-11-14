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
  createdAt: string;
  updatedAt: string;
  qrCode?: string;
}

export function useFirebaseCards() {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cards");
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
    async (cardData: Omit<BusinessCard, "id" | "slug" | "createdAt" | "updatedAt">) => {
      try {
        const response = await fetch("/api/cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cardData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create card");
        }

        await fetchCards(); // Refresh the list
        return data.card;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to create card");
      }
    },
    [fetchCards]
  );

  const getCard = useCallback(async (identifier: string): Promise<BusinessCard> => {
    try {
      if (!identifier.match(/^[a-f\d]{24}$/i)) {
        const response = await fetch(`/api/cards/slug/${identifier}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch card");
        }

        return data.card;
      }

      const allCards = await fetch("/api/cards").then((res) => res.json());
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
      const response = await fetch(`/api/cards/slug/${slug}`);
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
          const allCards = await fetch("/api/cards").then((res) => res.json());
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
          },
          body: JSON.stringify(cardData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update card");
        }

        await fetchCards(); // Refresh the list
        return data.card;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to update card");
      }
    },
    [fetchCards]
  );

  const deleteCard = useCallback(
    async (identifier: string) => {
      try {
        let slug = identifier;

        // If identifier looks like an ID, find the card first to get its slug
        if (identifier.match(/^[a-f\d]{24}$/i)) {
          const allCards = await fetch("/api/cards").then((res) => res.json());
          const card = allCards.cards?.find((c: BusinessCard) => c.id === identifier);
          if (!card) {
            throw new Error("Card not found");
          }
          slug = card.slug;
        }

        const response = await fetch(`/api/cards/slug/${slug}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to delete card");
        }

        await fetchCards(); // Refresh the list
        return true;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to delete card");
      }
    },
    [fetchCards]
  );

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

      // If it looks like a slug, use slug endpoint directly
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

      // If it looks like an ID, search through all cards
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
