-- Conteúdo inicial da Pousada Velho Chico (Icaraizinho de Amontada, Ceará),
-- clonado de velhochicoicaraizinho.com.br para o esquema site-loft.
-- Re-executável: limpa e re-insere. Imagens baixadas do site original ficam
-- em /uploads (public/); novos uploads do admin vão para o R2 (binding BUCKET).

-- ---------- Settings (JSON) ----------
INSERT OR REPLACE INTO settings (key, value) VALUES
('general', json('{
  "siteName": "Pousada Velho Chico",
  "logoText": "VELHO CHICO",
  "logoSubtext": "ICARAIZINHO DE AMONTADA",
  "location": "Icaraizinho de Amontada - CE",
  "instagramHandle": "@velhochicoicaraizinhooficial"
}')),
('hero', json('{
  "mode": "image",
  "imageUrl": "/uploads/hero.jpg",
  "videoUrl": "",
  "badge": "um hotel apaixonante em Icaraizinho",
  "title": "Hotel Velho Chico",
  "subtitle": "Aqui você é abraçado pela calmaria, desfruta de um bom serviço, boa comida, acomodações aconchegantes e se encanta com as tradições e paisagens do litoral oeste do Ceará.",
  "showBooking": true
}')),
('about', json('{
  "eyebrow": "SOBRE A POUSADA",
  "title": "UM HOTEL DE CHARME NA PRAIA DE ICARAIZINHO DE AMONTADA",
  "paragraphs": [
    "Aqui você é abraçado pela calmaria, desfruta de um bom serviço, boa comida, acomodações aconchegantes e se encanta com as tradições e paisagens do litoral oeste do Ceará.",
    "Nossa estrutura conta com piscina salinizada, restaurante rooftop Nativo Lounge com o melhor do mar e da culinária cearense, e acomodações que vão da suíte a dois até a suíte família para até 8 pessoas.",
    "A pousada também é pet friendly, permitindo que você aproveite sua estadia acompanhado do seu animal de estimação.",
    "Se apaixone por Icaraizinho de Amontada: Moitas e Caetanos, no seu ritmo, através das experiências que preparamos para você."
  ],
  "ctaLabel": "RESERVAR",
  "ctaUrl": "#reservar",
  "ctaNote": "FALE COM A GENTE PELO WHATSAPP.",
  "images": [
    "/uploads/about-1.jpg",
    "/uploads/about-2.jpg",
    "/uploads/about-3.jpg"
  ]
}')),
('highlightsSection', json('{ "title": "Sua Casa no Paraíso Cearense" }')),
('amenitiesSection', json('{ "title": "TUDO PARA SEU CONFORTO" }')),
('roomsSection', json('{ "eyebrow": "ACOMODAÇÕES", "title": "ACOMODAÇÕES EXCLUSIVAS E ACONCHEGANTES" }')),
('location', json('{
  "eyebrow": "ONDE ESTAMOS",
  "title": "ICARAIZINHO DE AMONTADA, CEARÁ",
  "paragraphs": [
    "A Pousada Velho Chico fica em Icaraizinho de Amontada, uma das praias mais charmosas do litoral oeste cearense, com ventos fortes, barcos ao mar, águas mornas e uma extensa faixa de areia que conecta o local a um vilarejo de pescadores.",
    "Histórias para contar por anos começam aqui: desbrave cenários charmosos, navegue por manguezais, descubra dunas douradas e saboreie ostras frescas — tudo com o conforto e a segurança de quem conhece cada segredo do litoral."
  ],
  "image": "/uploads/location.jpg",
  "ctaLabel": "RESERVAR SEU PASSEIO",
  "ctaUrl": "https://wa.me/5588981573001"
}')),
('testimonialsSection', json('{ "title": "O QUE NOSSOS HÓSPEDES COMENTAM SOBRE O HOTEL VELHO CHICO" }')),
('gallerySection', json('{ "title": "SIGA-NOS NO INSTAGRAM" }')),
('promo', json('{
  "title": "Reserve ou programe sua estadia. Venha viver momentos especiais no Hotel Velho Chico.",
  "ctaLabel": "RESERVAR",
  "ctaUrl": "https://wa.me/5588981573001",
  "image": "/uploads/promo.jpg"
}')),
('contact', json('{
  "cnpj": "",
  "groupText": "A Pousada Velho Chico proporciona as melhores experiências de hospedagem, conforto e gastronomia cearense em Icaraizinho de Amontada, Ceará.",
  "address": "R. Francisco Gonçalves de Souza, 292 - Icaraí, Amontada - CE, CEP 62545-000",
  "email": "",
  "phone": "+55 88 98157-3001",
  "whatsapp": "5588981573001",
  "instagram": "https://www.instagram.com/velhochicoicaraizinhooficial",
  "facebook": "https://www.facebook.com/velhochicoicarai"
}'));

-- ---------- Highlights ----------
DELETE FROM highlights;
INSERT INTO highlights (title, image_url, sort_order) VALUES
('Piscina salinizada', '/uploads/highlight-piscina.jpg', 1),
('Restaurante Nativo Lounge', '/uploads/highlight-restaurante.jpg', 2),
('Suítes exclusivas', '/uploads/highlight-suites.jpg', 3),
('Experiências em Icaraizinho', '/uploads/highlight-experiencias.jpg', 4);

-- ---------- Amenities ----------
DELETE FROM amenities;
INSERT INTO amenities (icon, label, description, sort_order) VALUES
('wifi', 'Wi-Fi gratuito', 'Internet Wi-Fi gratuita em toda a pousada — nas acomodações e nas áreas comuns.', 1),
('restaurant', 'Restaurante Nativo Lounge', 'O melhor do mar e da culinária cearense, com especialidades servidas no rooftop do Velho Chico.', 2),
('snow', 'Ar-condicionado', 'Todas as acomodações contam com ar-condicionado para garantir o seu conforto durante a estadia.', 3),
('paw', 'Pet friendly', 'Todas as nossas acomodações aceitam animais de estimação para que o seu pet aproveite a estadia com você.', 4),
('check', 'Ambiente 100% não fumante', 'Todas as acomodações do Velho Chico são ambientes livres de fumo.', 5),
('car', 'Piscina salinizada', 'Piscina salinizada com acesso facilitado a partir de várias acomodações da pousada.', 6),
('coffee', 'Frigobar em todos os quartos', 'Acomodações equipadas com frigobar, TV e armário para suas roupas.', 7);

-- ---------- Rooms ----------
DELETE FROM rooms;
INSERT INTO rooms (title, subtitle, description, image_url, amenities, sort_order) VALUES
('Dupla Varanda Térreo', 'Ideal para casal · Térreo · Varanda privativa',
 'Aconchegante suíte com 1 cama de casal, localizada no andar térreo e com varanda privativa. Ambiente 100% não fumante. Acomodação pet friendly.',
 '/uploads/rooms/dupla-varanda-terreo.jpg',
 json('["Ar-condicionado","TV tela plana","Frigobar","Armário para roupas","Wi-Fi","Banheiro privativo","Toalhas e amenities","Ambiente não fumante","Pet friendly"]'), 1),
('Tripla Varanda Térreo', 'Para até 3 pessoas · Térreo · Varanda privativa',
 'Aconchegante suíte para até 3 pessoas, localizada no andar térreo e com varanda privativa. Ambiente 100% não fumante. Acomodação pet friendly.',
 '/uploads/rooms/tripla-varanda-terreo.jpg',
 json('["Ar-condicionado","TV tela plana","Frigobar","Armário para roupas","Wi-Fi","Banheiro privativo","Toalhas e amenities","Ambiente não fumante","Pet friendly"]'), 2),
('Loft', 'Banheira de hidromassagem · Cozinha e churrasqueira privativas',
 'Pensada para casais que buscam uma estadia especial em Icaraizinho de Amontada, a Suíte Duplex é preparada para oferecer momentos inesquecíveis. No andar inferior, um quarto aconchegante com cama de casal e uma relaxante banheira de hidromassagem. No piso superior, um espaço privativo com churrasqueira e cozinha equipada — perfeita para preparar refeições a dois com total privacidade. Ambiente 100% não fumante. Acomodação pet friendly.',
 '/uploads/rooms/loft.jpg',
 json('["Ar-condicionado","TV","Frigobar","Wi-Fi","Banheiro completo","Banheira de hidromassagem","Cozinha e churrasqueira privativas","Possibilidade de cama extra","Ambiente não fumante","Pet friendly"]'), 3),
('Suíte Quarto e Sala – Apto Família', 'Até 5 pessoas · Varanda privativa · Cozinha equipada',
 'Ideal para viagens em família ou entre amigos para Icaraizinho de Amontada. Oferece o equilíbrio perfeito entre conforto e funcionalidade, com ambientes integrados: varanda mobiliada, sala com TV, sofá-cama e ventilador, cozinha completa, e quarto com cama queen size. Banheiro com ducha quente e acesso duplo à sala e ao quarto. Ambiente 100% não fumante. Acomodação pet friendly.',
 '/uploads/rooms/suite-quarto-sala.jpg',
 json('["Varanda mobiliada","Sala com TV e sofá-cama","Ventilador","Cozinha completa","Cama queen size","Ar-condicionado","Frigobar","TV Smart","Wi-Fi","Banheiro com ducha quente","Ambiente não fumante","Pet friendly"]'), 4),
('Suíte Pôr do Sol', 'Até 6 pessoas · 3 quartos · Vista espetacular',
 'Para quem deseja se desconectar do mundo, a Suíte Pôr do Sol oferece uma experiência relaxante na hidromassagem, com vista para o céu de Icaraizinho ao fim da tarde. Varanda com mesa e acesso à área de piscina, sala com Smart TV e sofá-cama, 3 quartos com cama de casal king-size, hidromassagem interna com vista para o pôr do sol. Ambiente 100% não fumante. Acomodação pet friendly.',
 '/uploads/rooms/suite-por-do-sol.jpg',
 json('["Varanda com mesa","Acesso à área de piscina","Sala com Smart TV e sofá-cama","3 quartos com cama king-size","Wi-Fi","Frigobar","Banheiro completo","Chuveiro quente","Hidromassagem interna com vista","Ambiente não fumante","Pet friendly"]'), 5),
('Suíte Família', 'Até 8 pessoas · Duplex',
 'Para quem busca uma acomodação acolhedora com aquele jeitinho de casa de praia, esta suíte oferece dois andares com acesso facilitado à piscina salinizada do Velho Chico. No primeiro andar: sala com Tv Smart integrada a uma pequena cozinha com geladeira e 1 quarto com cama queen size. No andar superior: 2 quartos com cama queen size, ar-condicionado e varanda. Ambiente 100% não fumante. Acomodação pet friendly.',
 '/uploads/rooms/suite-familia.jpg',
 json('["Duplex","Acesso à piscina salinizada","Sala com Tv Smart","Cozinha com geladeira","3 quartos com cama queen size","Ar-condicionado","2 banheiros com ducha quente","Varanda","Ambiente não fumante","Pet friendly"]'), 6);

-- ---------- Testimonials ----------
DELETE FROM testimonials;
INSERT INTO testimonials (title, quote, author, rating, sort_order) VALUES
('A melhor decisão para a nossa Lua de Mel',
 'Escolhemos a Pousada Velho Chico para nossa Lua de Mel. E foi a nossa melhor decisão, a Pousada pessoalmente é mais bonita que nas fotos e vídeos. Vale muito à pena conhecer e se hospedar, ficamos surpresos com o bom espaço e boa estrutura. Próximo da Vila com lojas e barracas de praia. Fomos recepcionados pelas atendentes Milena e também pela Letícia, sempre muito simpáticas e atenciosas. No restaurante da pousada, comida boa e preço acessível, excelente atendimento do Sr. Pedro.',
 'Diego Brito Locutor · Férias, Casal', 5, 1),
('Atendimento impecável do início ao fim',
 'Ficamos encantados com a experiência na pousada! O atendimento foi impecável do início ao fim, todos os funcionários foram extremamente atenciosos, prestativos e sempre prontos para ajudar com um sorriso no rosto. É raro encontrar um serviço tão acolhedor e genuinamente preocupado com o bem-estar dos hóspedes.',
 'Adriana Rodrigues', 5, 2),
('Serviço de primeira, do café ao lazer',
 'Adorei tudo o que foi de serviços nessa pousada. Desde o atendimento na recepção, serviço de quarto e a forma como são dispostas as camas. Outro detalhe: a cozinha, serviço de primeira, buffet farto no café da manhã, delicioso. A área de lazer, piscina, espaço para churrasco são também de excelente qualidade!',
 'Jose Ribamar Silva · Férias, Família', 5, 3),
('Localização excelente e ótimo custo-benefício',
 'Fiquei com amigas na pousada por uma semana, foi incrível! Colaboradores muito solícitos e simpáticos. A pousada tem uma localização excelente e ótimo custo benefício. O café da manhã é muito gostoso!',
 'Ana Flávia Peluzzo · Férias, Amigos', 5, 4),
('Apaixonada pelo lugar',
 'O lugar é perfeito, atendimento excelente e com ótima estadia, com certeza voltarei mais vezes! Fiquei apaixonada pelo lugar, fui com meu esposo e lá tinha todo acompanhamento e suporte com os passeios! Eu amei! Incrível.',
 'Raquel França · Férias, Casal', 5, 5),
('Realmente me senti em casa',
 'Parabéns pessoal! Vocês dão aula de bom atendimento! Muito gentis, atenciosos e educados. Pude observar o cuidado e organização em cada detalhe. A Letícia, recepcionista, foi muito atenciosa e nos ajudou com boas recomendações de locais na cidade. Os quartos são amplos e com ótimo funcionamento de banheiro, tv, cama confortável… realmente me senti em casa e quero voltar mais vezes.',
 'Rebeca Jardim', 5, 6);

-- ---------- Gallery ----------
DELETE FROM gallery;
INSERT INTO gallery (image_url, caption, sort_order) VALUES
('/uploads/gallery/g01.jpg', 'Restaurante Nativo Lounge', 1),
('/uploads/gallery/g02.jpg', 'Nativo Lounge', 2),
('/uploads/gallery/g03.jpg', 'Gastronomia cearense', 3),
('/uploads/gallery/g04.jpg', 'Sabores do rooftop', 4),
('/uploads/gallery/g05.jpg', 'Pratos da casa', 5),
('/uploads/gallery/g06.jpg', 'Nativo Lounge à noite', 6),
('/uploads/gallery/g07.jpg', 'Passeio de barco', 7),
('/uploads/gallery/g08.jpg', 'Manguezal', 8),
('/uploads/gallery/g09.jpg', 'Dunas de Icaraizinho', 9),
('/uploads/gallery/g10.jpg', 'Litoral oeste cearense', 10),
('/uploads/gallery/g11.jpg', 'Praia de Icaraizinho', 11),
('/uploads/gallery/g12.jpg', 'Passeio pelo Rio Aracatiaçu', 12),
('/uploads/gallery/g13.jpg', 'Ilha das Ostras', 13),
('/uploads/gallery/g14.jpg', 'Barra de Moitas', 14),
('/uploads/gallery/g15.jpg', 'Lençóis de Caetanos', 15),
('/uploads/gallery/g16.jpg', 'Coqueiros da Preguiça', 16),
('/uploads/gallery/g17.jpg', 'Pedra do Coração', 17),
('/uploads/gallery/g18.jpg', 'Vila de pescadores', 18),
('/uploads/gallery/g19.jpg', 'Passeio em família', 19),
('/uploads/gallery/g20.jpg', 'Paisagens de Caetanos', 20),
('/uploads/gallery/g21.jpg', 'Navegando por Moitas', 21),
('/uploads/gallery/g22.jpg', 'Experiências Velho Chico', 22),
('/uploads/gallery/g23.jpg', 'Litoral oeste', 23),
('/uploads/gallery/g24.jpg', 'Vista da pousada', 24);

-- ---------- Títulos das seções extras ----------
INSERT OR REPLACE INTO settings (key, value) VALUES
('experiencesSection', json('{ "eyebrow": "SE APAIXONE POR ICARAIZINHO", "title": "EXPERIÊNCIAS PARA TODOS OS ESTILOS DE VIAGEM" }')),
('packagesSection', json('{ "eyebrow": "OFERTAS ESPECIAIS", "title": "NOSSOS PACOTES" }')),
('promotionsSection', json('{ "eyebrow": "APROVEITE", "title": "PROMOÇÕES" }')),
('blogSection', json('{ "eyebrow": "DIÁRIO DO VELHO CHICO", "title": "NOSSO BLOG" }'));

-- ---------- Tema / paleta de cores (editável na aba "Aparência" do admin) ----------
-- Terracota extraído da logo original (#a93a16), com tons areia/litoral.
INSERT OR REPLACE INTO settings (key, value) VALUES
('theme', json('{
  "brand": "#a93a16",
  "brandDark": "#7c2a10",
  "brandLight": "#f6ece4",
  "ink": "#2c1b12",
  "eyebrow": "#c1521f"
}'));

-- ---------- Tour Virtual 360° (desativado — Velho Chico não possui) ----------
INSERT OR REPLACE INTO settings (key, value) VALUES
('tour', json('{
  "enabled": false,
  "eyebrow": "",
  "title": "",
  "subtitle": "",
  "url": ""
}'));

-- ---------- Experiences (passeios: Moitas e Caetanos) ----------
DELETE FROM experiences;
INSERT INTO experiences (title, description, image_url, sort_order) VALUES
('Navegue com seu amor por Moitas',
 'Passeamos juntos de barco pelo Rio Aracatiaçu. Partimos da Praia de Moitas, seguimos até o encontro do rio com o mar na Praia da Ponta e adentramos em um manguezal perfeito para fotos com seu amor. O passeio inclui parada na Ilha das Ostras (com petiscos: ostra, povo, peixe, camarão e drinks) e visita às Dunas da Barra de Moitas.',
 '/uploads/experience-moitas.jpg', 1),
('Descubra os Lençóis Cearenses, em Caetanos',
 'Coqueiros da Preguiça (palco para fotos inesquecíveis), Pedra do Coração (símbolo natural para juras de amor) e almoço opcional na vila de pescadores com peixe fresco na brasa. Ideal para famílias descobrirem juntas paisagens que parecem cenário de filme.',
 '/uploads/experience-caetanos.jpg', 2);

-- ---------- Promotions (sem promoções ativas no site original) ----------
DELETE FROM promotions;

-- ---------- Packages (sem pacotes no site original) ----------
DELETE FROM packages;

-- ---------- Posts (sem blog no site original) ----------
DELETE FROM posts;
