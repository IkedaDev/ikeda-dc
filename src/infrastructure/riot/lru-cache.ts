// src/infrastructure/riot/lru-cache.ts

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

/**
 * Clase utilitaria para manejar una caché en memoria (in-memory) con políticas de
 * tiempo de vida (TTL) y límite máximo de elementos (LRU - Least Recently Used).
 * 
 * Aprovecha la propiedad de JavaScript Map, la cual mantiene el orden de inserción.
 * Al leer o actualizar un elemento, lo eliminamos y re-insertamos para moverlo al
 * final de la lista, asegurando que el primer elemento del iterador siempre sea el LRU.
 */
export class LruCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxKeys: number
  ) {
    if (maxKeys <= 0) {
      throw new Error('El límite maxKeys debe ser mayor que 0');
    }
  }

  /**
   * Obtiene un valor de la caché.
   * Si el elemento expiró por TTL, lo remueve de la caché y retorna undefined.
   */
  public get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Verificar si el elemento ha expirado
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Actualizar recencia: eliminamos y re-insertamos para que pase al final (más reciente)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Agrega o actualiza un valor en la caché.
   * Si excede maxKeys, remueve el elemento menos recientemente utilizado (LRU).
   */
  public set(key: K, value: V, customTtlMs?: number): void {
    // Si ya existe, lo borramos para actualizar su posición al re-insertar
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxKeys) {
      // Evicción LRU: se obtiene la primera clave insertada (la más antigua / menos usada)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const ttl = customTtlMs ?? this.ttlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Elimina un elemento de la caché.
   */
  public delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpia toda la caché.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Retorna la cantidad actual de elementos en caché.
   */
  public size(): number {
    return this.cache.size;
  }
}
