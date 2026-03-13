<template>
  <section class="card dia-card">
    <header class="card-header">
      <span class="pill">Día {{ dia.numero }}</span>
      <h2>{{ dia.nombre }}</h2>
    </header>

    <div class="dia-meta" v-if="dia.movilidad || dia.activacion">
      <div v-if="dia.movilidad" class="meta-block">
        <span class="meta-label">Movilidad</span>
        <p class="meta-text">{{ dia.movilidad }}</p>
      </div>
      <div v-if="dia.activacion" class="meta-block">
        <span class="meta-label">Activación</span>
        <p class="meta-text">{{ dia.activacion }}</p>
      </div>
    </div>

    <div class="ejercicios-list">
      <EjercicioCard
        v-for="ej in dia.ejercicios"
        :key="ej.id"
        :ejercicio="ej"
        :serie="ej.ejercicioSemanas[0]"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Dia } from '@/types';
import EjercicioCard from './EjercicioCard.vue';

defineProps<{
  dia: Dia;
}>();
</script>

