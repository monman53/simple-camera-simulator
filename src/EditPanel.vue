<script setup lang="ts">
import { calcLensInfo, lensGroups } from './globals';
import { humanReadable, removeElement } from './utils';

</script>

<template>
    <div class="edit-panel-base">
        <!-- Lenses -->
        <template v-for="(lensGroup, i) of lensGroups">
            <template v-if="lensGroup.selected">
                <fieldset>
                    <legend>
                        Group {{ i }} (f: {{ humanReadable(calcLensInfo(lensGroup.lenses).f) }})
                        <i class="bi bi-trash pointer" @click="removeElement(lensGroups, i)"></i>
                    </legend>
                    <template v-for="(lens, j) of lensGroup.lenses">
                        <fieldset>
                            <legend>Lens {{ j }} (f: {{ humanReadable(calcLensInfo([lens]).f) }})</legend>
                            <table>
                                <tr>
                                    <th>x</th>
                                    <th>r</th>
                                </tr>
                                <template v-for="plane of lens.planes">
                                    <tr>
                                        <td><input type="number" v-model.number="plane.x"></td>
                                        <td><input type="number" v-model.number="plane.r"></td>
                                    </tr>
                                </template>
                            </table>
                        </fieldset>
                    </template>
                </fieldset>
            </template>
        </template>
    </div>
</template>

<style>
.edit-panel-base {
    padding: 0.5em;
}

table td {
    text-align: right;
}

input[type='number'] {
    width: 5em;
}

h3,
h4 {
    margin: 0;
}

fieldset {
    padding: 0.1em 0.2em;
    border-top: 0;
    border-bottom: 0;
    border-right: 0;
}
</style>