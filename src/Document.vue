<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
    window.MathJax.typesetPromise();
})

</script>
<!-- 
    When \(a \ne 0\), there are two solutions to \(ax^2 + bx + c = 0\) and they are
    $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$

    $$
    \begin{eqnarray}
     = S_n = a_1 + a_2 + ....+a_n
    \end{eqnarray}
    $$
-->


<template>
    <h3>Simple camera simulator</h3>

    <dl>
        <dt>Lensmaker's equation</dt>
        <dd>
            <p>
                $$
                \begin{eqnarray}
                \frac{1}{f} = (n - 1)\left(\frac{1}{R_1} - \frac{1}{R_2}\right) + \frac{d(n-1)^2}{R_1 R_2}
                \end{eqnarray}
                $$
                \(f\) : Focal length<br>
                \(n\) : Refractive index<br>
                \(R_1\) : Radius of curvature of the left side of surface (positive).<br>
                \(R_2\) : Radius of curvature of the right side of surface (negative).<br>
                \(d\) : Thickness (distance between left and right surface on the optical axis).<br>
            </p>
            <!-- <p>
                In this application, we assume \(R = R_1 = -R_2 > 0\), and
                \(d\) is replaced by \(d = 2(R - \sqrt{R^2 - r^2})\) where \(r\) is radius of the lens.
                Then, the equation becomes
                $$
                \begin{eqnarray}
                \frac{1}{f} = \frac{2(n-1)}{R} + \frac{2(R - \sqrt{R^2 - r^2})(n-1)^2}{R^2}.
                \end{eqnarray}
                $$
            </p> -->
        </dd>

        <!-- <dt><a href="https://en.wikipedia.org/wiki/Focal_length">Focal length</a></dt> -->
    </dl>

    <h3>Notice</h3>
    <ul>
        <li>Theoretical correctness is not guaranteed.</li>
        <li>Here, we assume that the camera lens is singe symmetric spherical convex lens. The real camera lens is
            composed
            from multiple types of lenses.</li>
        <li>The rays inside the ideal lens are not visualized correctly. The rays are refracted at the center plane of
            the
            lens.</li>
        <li>The visual may differ depending on the browser.</li>
        <li>Enabling GPU acceleration is highly recommended. (e.g. Enable Vulcan for Chrome)</li>
    </ul>
</template>

<style scoped>
dt {
    font-weight: bold;
}

dd {
    margin-bottom: 0.9rem;
}

a {
    color: white;
}
</style>