<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FinTrack Pro | O Melhor Sistema de Gestão Financeira Pessoal</title>
    <meta name="description" content="Organize sua vida financeira com o FinTrack Pro. Controle contas, cartões de crédito e compartilhe com sua família. O sistema mais completo com saldo projetado e relatórios inteligentes.">
    <meta name="keywords" content="gestão financeira, controle de gastos, finanças pessoais, planejamento financeiro, finanças familiar, fintrack pro">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://fintrackweb.com.br/">
    <meta property="og:title" content="FinTrack Pro | Gestão Financeira Inteligente">
    <meta property="og:description" content="Chega de planilhas complexas. Assuma o controle total do seu dinheiro com uma interface premium e simples.">
    <meta property="og:image" content="{{ asset('og-image.png') }}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://fintrackweb.com.br/">
    <meta property="twitter:title" content="FinTrack Pro | Gestão Financeira Inteligente">
    <meta property="twitter:description" content="Organize suas finanças de forma premium e descomplicada.">
    <meta property="twitter:image" content="{{ asset('og-image.png') }}">

    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">

    <!--
        PERFORMANCE: Fontes carregadas de forma não-bloqueante via Google Fonts.
        - preconnect: elimina latência de DNS/TLS antes do browser precisar da fonte
        - preload as="style": inicia o download do CSS da fonte mais cedo
        - media="print" + onload: carrega CSS sem bloquear o render (técnica crítica para FCP)
        - noscript: fallback para ambientes sem JavaScript
        Resultado esperado: elimina FOIT e reduz FCP em ~0.8s
    -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"></noscript>

    <script>
      // Early theme detection to prevent white/dark flash
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.className = theme;
    </script>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])

    <!-- Google tag (gtag.js) - LAZY LOADED -->
    <script>
      function loadGTM() {
        if (window.gtmLoaded) return;
        window.gtmLoaded = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=AW-924937648";
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-924937648');
      }

      // Load on interaction or 3.5s timeout
      ['mouseover', 'keydown', 'touchmove', 'touchstart', 'scroll'].forEach(ev => {
        window.addEventListener(ev, loadGTM, {once: true, passive: true});
      });
      setTimeout(loadGTM, 3500);
    </script>
</head>
<body class="antialiased">
    <div id="root"></div>
</body>
</html>
