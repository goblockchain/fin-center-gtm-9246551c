-- ============================================================================
-- Fin Center — seed.sql  (dados reais da Sprint de Validação de Canais)
-- Gerado a partir de: CRM Consolidado.xlsx, Fin_Roadmap_Validacao_Canais.xlsx,
--                     Weekly_Review_Tracking_Fin.xlsx
-- 5 canais · 136 cafeterias (contas) · 136 oportunidades · 29 tarefas · 2 gates
-- Bloco de DEMONSTRAÇÃO claramente marcado no fim.
-- Rodar APÓS as migrations (schema + RLS + views).
-- ============================================================================

begin;

truncate table mensagens_log, modelos_mensagem, voz_do_cliente, interacoes, contatos,
  oportunidades, contas, tarefas, gates, investimentos, canais restart identity cascade;

-- ---------- Canais (a unidade central) ----------
insert into canais (id,slug,nome,prioridade,hipotese,teste_minimo,metrica_sucesso,meta_vs_baseline,dependencia,responsavel,gate_data,ordem) values
('1948d0dd-cc43-5c6b-bff1-4883dd942d44','base-yungas','Base Yungas (parceria)',1,'Clientes da Yungas (franquias/food service) são ICP exato; indicação morna converte muito.','Fechar 1 mecanismo de acesso (intros mornas, co-marketing ou webinar) e rodar piloto.','≥40% das intros viram discovery; ≥3 pilotos/fechamentos.','≥10x a conversão do frio','Alinhamento Henrique + contato Yungas; definir contrapartida.','Natalia + Henrique','2026-07-18',1),
('c52640de-ec41-5c26-97de-4fc81d8f6c1e','member-get-member','Member-get-member',2,'Dono satisfeito indica 1–2 pares se pedirmos com incentivo claro.','Pedir 2 indicações a cada cliente ativo + incentivo (1 mês grátis / desconto).','≥0,5 indicação por cliente; conversão das indicações.','Indicação > frio por definição','Requer clientes ativos satisfeitos.','Natalia','2026-07-18',2),
('ee59e5dc-f871-5187-9cb6-f769b03dd9f6','indicacoes','Indicações (rede e advisors)',2,'A rede da Natalia/Fin (JCI, FoundersClub, RD, Founder Haus, advisors) gera intros qualificadas.','Mapear 20 conexões de 2º grau no ICP; pedir intro a 10.','Nº de intros qualificadas em 3 semanas (meta ≥5).','Intro > frio por definição','Tempo da Natalia; começa já (S1).','Natalia','2026-07-18',3),
('84043611-274c-5fbc-9c5f-cf8bf7fd12a6','outbound','Outbound (reformulado)',3,'Outbound só funciona com ICP estreito + contato DIRETO com o decisor + 1ª mensagem ancorada na dor.','30 donos abordados direto (IG DM/LinkedIn), A/B de 2 mensagens de dor.','Contato→reunião ≥10–15%.','≥5–7x baseline p/ seguir','Lista de decisores (não número do balcão); mensagens reescritas.','Natalia','2026-07-18',4),
('ef3be889-0994-57f5-9665-c3e04d1fc4ce','inbound','Inbound (cobertura aérea)',4,'Conteúdo (LinkedIn: negócios×IA×comportamento) + site claro geram inbound qualificado ao longo do tempo.','Cadência 3x/semana + corrigir site (SPA não indexável) + CTA claro.','Nº de conversas inbound iniciadas/mês.','Não medir fechamento na janela','Correção do site (dev Fin); constância de publicação.','Natalia (+ dev Fin)','2026-08-22',5);

-- ---------- Investimento por canal (planejado vs executado) ----------
insert into investimentos (canal_id,planejado,executado,periodo) values
('1948d0dd-cc43-5c6b-bff1-4883dd942d44',2000,500,'Sprint 16/jun–24/ago'),
('c52640de-ec41-5c26-97de-4fc81d8f6c1e',1500,0,'Sprint 16/jun–24/ago'),
('ee59e5dc-f871-5187-9cb6-f769b03dd9f6',500,200,'Sprint 16/jun–24/ago'),
('84043611-274c-5fbc-9c5f-cf8bf7fd12a6',1200,800,'Sprint 16/jun–24/ago'),
('ef3be889-0994-57f5-9665-c3e04d1fc4ce',3000,1200,'Sprint 16/jun–24/ago');

-- ---------- Gates de decisão ----------
insert into gates (nome,data,criterio,decisao_possivel,ordem) values
('Gate 1 — meio','2026-07-18','Conversão por canal vs baseline de 2%; custo/esforço por reunião gerada.','Matar canal morto • iterar promissor • escalar vencedor',1),
('Gate 2 — final','2026-08-22','Qual canal entrega reuniões/fechamentos de forma repetível e barata?','Recomendar 1–2 canais p/ escalar no próximo ciclo + readout p/ aprofundamento',2);

-- ---------- Tarefas (29) ----------
insert into tarefas (id,codigo,canal_id,frente,titulo,responsavel,data_inicio,prazo,status,ordem) values
('622b082f-b47d-57a8-aa45-feea78a7f47e','S1',null,'Setup','Decidir nome único (Fin vs UseFin) e alinhar domínio/IG/LinkedIn','Natalia + Henrique','2026-06-16','2026-06-20','a_fazer',1),
('b4798ef6-4cd4-5d5b-948a-d961b4176634','S2',null,'Setup','Resolver inconsistência de preço (99/590 vs 250/850)','Natalia + Henrique','2026-06-16','2026-06-20','a_fazer',2),
('64b30dd9-3dbf-51ea-bf06-44625ee26749','S3',null,'Setup','Definir ICP preciso (segmento, faturamento, nº de unidades)','Natalia','2026-06-16','2026-06-20','a_fazer',3),
('d6c2dfb2-9ccb-500a-ae5f-b616b746009a','S4',null,'Setup','Criar campo ''Canal/Origem'' + status padronizado no CRM','Natalia','2026-06-16','2026-06-22','a_fazer',4),
('3ffe87fc-774c-56c5-82bf-3516780a4fa9','S5',null,'Setup','Registrar baseline (2%) e metas por canal','Natalia','2026-06-18','2026-06-22','a_fazer',5),
('642e11fe-5608-5f38-9874-7ddef7cebc3c','S6',null,'Setup','Montar prova: 2–3 cases/depoimentos + one-pager','Natalia + Henrique','2026-06-16','2026-06-27','a_fazer',6),
('59e91b14-4406-5a42-8099-01431408273e','Y1','1948d0dd-cc43-5c6b-bff1-4883dd942d44','Yungas','Alinhar com Henrique a abordagem à Yungas + contrapartida','Natalia + Henrique','2026-06-16','2026-06-20','a_fazer',7),
('b9f3bc3d-9766-5f68-87e1-9619ef1dc55f','Y2','1948d0dd-cc43-5c6b-bff1-4883dd942d44','Yungas','Reunião c/ contato Yungas: definir mecanismo (intros/co-mkt/webinar)','Henrique','2026-06-23','2026-06-27','a_fazer',8),
('1c4253e0-d25f-5bf6-b277-319a36ba304e','Y3','1948d0dd-cc43-5c6b-bff1-4883dd942d44','Yungas','Selecionar 10–20 contas-piloto da base no ICP','Natalia','2026-06-27','2026-06-30','a_fazer',9),
('3d36306c-2b08-5718-8168-a97f020f54a5','Y4','1948d0dd-cc43-5c6b-bff1-4883dd942d44','Yungas','Rodar piloto de intros mornas + discovery','Natalia','2026-06-30','2026-07-18','a_fazer',10),
('57a7271c-938f-5d81-8016-5ce140ca4d99','Y5','1948d0dd-cc43-5c6b-bff1-4883dd942d44','Yungas','Gate: medir conversão vs baseline; decidir escala','Natalia + Henrique','2026-07-18','2026-07-18','a_fazer',11),
('588464c1-8178-5a95-9ad8-b579b7c6c174','M1','c52640de-ec41-5c26-97de-4fc81d8f6c1e','Member-get-member','Mapear clientes ativos satisfeitos (pré-requisito)','Natalia','2026-06-23','2026-06-25','a_fazer',12),
('c587ca33-f2bc-57c2-a08e-fd64edbc074d','M2','c52640de-ec41-5c26-97de-4fc81d8f6c1e','Member-get-member','Definir incentivo de indicação','Natalia + Henrique','2026-06-23','2026-06-27','a_fazer',13),
('2f06b549-9e33-5e10-b853-9958d70bedad','M3','c52640de-ec41-5c26-97de-4fc81d8f6c1e','Member-get-member','Pedir 2 indicações a cada cliente ativo','Natalia','2026-06-30','2026-07-18','a_fazer',14),
('4a52d1aa-4ea9-5850-b321-3c8fa8fbb0ea','M4','c52640de-ec41-5c26-97de-4fc81d8f6c1e','Member-get-member','Gate: taxa de indicação e conversão','Natalia','2026-07-18','2026-07-18','a_fazer',15),
('187899b1-295f-5df9-9b6b-267173656aea','I1','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','Indicações','Mapear 20 conexões 2º grau no ICP (JCI, FoundersClub, RD, Founder Haus)','Natalia','2026-06-16','2026-06-25','a_fazer',16),
('659eaa3e-552f-50ad-b46f-ea30c3190673','I2','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','Indicações','Pedir intro a 10 conexões','Natalia','2026-06-23','2026-07-11','a_fazer',17),
('5c50da32-6c42-5398-b719-5907a45ef4eb','I3','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','Indicações','Gate: nº de intros qualificadas','Natalia','2026-07-18','2026-07-18','a_fazer',18),
('a74b0973-4af3-5b16-aeca-9d6dc59975a7','O1','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','Outbound','Reescrever 1º toque ancorado na dor (parar pesquisa paga)','Natalia','2026-06-23','2026-06-27','a_fazer',19),
('416eb946-d6f5-5de3-8ff7-bc1ed6a7a11a','O2','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','Outbound','Montar lista de 30 DECISORES abordáveis direto','Natalia','2026-06-23','2026-06-30','a_fazer',20),
('e58815c6-f26e-5a8a-88a2-7c86c565c2c7','O3','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','Outbound','Rodar A/B de 2 mensagens com 30 decisores','Natalia','2026-06-30','2026-07-18','a_fazer',21),
('2257d805-7439-5678-baf4-02c33a804144','O4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','Outbound','Gate: contato→reunião vs 2%; escalar ou rebaixar','Natalia','2026-07-18','2026-07-18','a_fazer',22),
('8addcf39-4f06-5018-9bd0-7a87e4c60d2d','N1','ef3be889-0994-57f5-9665-c3e04d1fc4ce','Inbound','Corrigir site p/ indexação + CTA claro de contato','Natalia + dev Fin','2026-06-23','2026-07-04','a_fazer',23),
('822c6ad5-fdbd-5dbb-b767-100f3037b67c','N2','ef3be889-0994-57f5-9665-c3e04d1fc4ce','Inbound','Definir cadência de conteúdo 3x/sem (negócios×IA×comportamento)','Natalia','2026-06-16','2026-06-20','a_fazer',24),
('b1fe034b-29cf-5f71-8815-d656fd3059ea','N3','ef3be889-0994-57f5-9665-c3e04d1fc4ce','Inbound','Publicar e medir conversas inbound iniciadas','Natalia','2026-06-23','2026-08-22','a_fazer',25),
('e3feb389-2d35-57b5-8d33-591722f2f631','N4','ef3be889-0994-57f5-9665-c3e04d1fc4ce','Inbound','Gate (tendência): avaliar no readout final','Natalia','2026-08-22','2026-08-22','a_fazer',26),
('65f3ddff-9e45-5b29-827c-26fc95ea4166','G1',null,'Gates','Gate 1 (meio): revisar 5 canais — matar/iterar/escalar','Natalia + Henrique','2026-07-18','2026-07-18','a_fazer',27),
('6235f712-7055-5131-8c4e-763c0f3fa191','G2',null,'Gates','Escalar canal(is) vencedor(es)','Natalia','2026-07-21','2026-08-21','a_fazer',28),
('963d1167-b22a-5f27-be89-72dbca0d41fa','G3',null,'Gates','Gate 2 (final) + readout p/ conversa de aprofundamento','Natalia + Henrique','2026-08-22','2026-08-22','a_fazer',29);

-- dependências (bloqueada se a dependência não está 'feito')
update tarefas set depende_de='d6c2dfb2-9ccb-500a-ae5f-b616b746009a' where codigo='S5';
update tarefas set depende_de='59e91b14-4406-5a42-8099-01431408273e' where codigo='Y2';
update tarefas set depende_de='b9f3bc3d-9766-5f68-87e1-9619ef1dc55f' where codigo='Y3';
update tarefas set depende_de='1c4253e0-d25f-5bf6-b277-319a36ba304e' where codigo='Y4';
update tarefas set depende_de='3d36306c-2b08-5718-8168-a97f020f54a5' where codigo='Y5';
update tarefas set depende_de='588464c1-8178-5a95-9ad8-b579b7c6c174' where codigo='M2';
update tarefas set depende_de='c587ca33-f2bc-57c2-a08e-fd64edbc074d' where codigo='M3';
update tarefas set depende_de='2f06b549-9e33-5e10-b853-9958d70bedad' where codigo='M4';
update tarefas set depende_de='187899b1-295f-5df9-9b6b-267173656aea' where codigo='I2';
update tarefas set depende_de='659eaa3e-552f-50ad-b46f-ea30c3190673' where codigo='I3';
update tarefas set depende_de='416eb946-d6f5-5de3-8ff7-bc1ed6a7a11a' where codigo='O3';
update tarefas set depende_de='e58815c6-f26e-5a8a-88a2-7c86c565c2c7' where codigo='O4';
update tarefas set depende_de='8addcf39-4f06-5018-9bd0-7a87e4c60d2d' where codigo='N3';
update tarefas set depende_de='b1fe034b-29cf-5f71-8815-d656fd3059ea' where codigo='N4';
update tarefas set depende_de='65f3ddff-9e45-5b29-827c-26fc95ea4166' where codigo='G2';
update tarefas set depende_de='6235f712-7055-5131-8c4e-763c0f3fa191' where codigo='G3';

-- ---------- Modelos de mensagem ({nome}{cafe}{dor}, A/B) ----------
insert into modelos_mensagem (canal_id,estagio,titulo,variante,corpo) values
('84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado','Outbound — 1º toque (dor: virou contador)','A','Oi {nome}! Acompanho o {cafe} e queria te perguntar: hoje quem cuida dos boletos e de saber pra onde vai o dinheiro? Pergunto porque a maioria dos donos vira o contador do próprio negócio — {dor}. A Fin assume esse trabalho e te devolve as horas. Topa 10 min?'),
('84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado','Outbound — 1º toque (dor: CMV/cobrança)','B','{nome}, uma pergunta rápida sobre o {cafe}: você consegue dizer seu lucro do mês passado sem abrir 5 planilhas? {dor} A gente cuida das contas a pagar e da DRE ao vivo pelo WhatsApp. Posso te mostrar em 10 min?'),
('ee59e5dc-f871-5187-9cb6-f769b03dd9f6','qualificado','Indicação — intro morna','A','Oi {nome}! O(a) {dor} comentou que você toca o {cafe} e que talvez fizesse sentido a gente conversar. A Fin é o time financeiro de contas a pagar pra cafeterias — entrego no WhatsApp. Quando você tem 15 min essa semana?'),
('1948d0dd-cc43-5c6b-bff1-4883dd942d44','reuniao','Yungas — piloto de rede','A','{nome}, como vocês são da base Yungas, montei um piloto rápido pro {cafe}: 15 dias com a Fin cuidando das contas a pagar e DRE ao vivo, sem você adotar sistema novo. {dor} Te mando a proposta?'),
('c52640de-ec41-5c26-97de-4fc81d8f6c1e','contatado','Member-get-member — pedido de indicação','A','{nome}, que bom que a Fin tá ajudando o {cafe}! Você conhece 1–2 donos que vivem a mesma dor ({dor})? Se topar indicar, libero 1 mês de cortesia pra você. Quem vem à cabeça?'),
('ef3be889-0994-57f5-9665-c3e04d1fc4ce','cadastrado','Inbound — resposta a DM de conteúdo','A','Oi {nome}, obrigada por comentar! Esse conteúdo nasceu de um problema real: {dor}. Se quiser, te explico em 10 min como a Fin resolve isso pro {cafe} sem você operar mais um sistema.');

-- ---------- Contas (cafeterias reais) ----------
insert into contas (id,nome,endereco,bairro,telefone,instagram,canal_origem_id,temperatura,responsavel,visitada,entrevista_agendada,data_primeiro_contato,proxima_acao,obs,ref_externa) values
('ea0fe8e3-d9ac-5541-928f-c4b02645070d','Fazendinha Floripa','Rod. José Carlos Daux, 11198 - Santo Antônio de Lisboa','Santo Antônio de Lisboa','(48) 99178-7410',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'1.0'),
('d674f51a-2373-533b-848b-fc28b22f76c0','Bombardelli Pâtisserie','R. Joe Collaço, 112 - Córrego Grande','Córrego Grande','(48) 98485-5682','@bombardellipatisserie','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'2.0'),
('62fbab58-adfa-5ee3-995c-74287c883cb5','Padaria Café François','Av. ao Corporate Park, 8600 - Saco Grande','Saco Grande','(48) 3226-0004','@padariafrancoisfloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','3.0'),
('45b5108e-7805-5528-946c-7d20017f6bf7','FairyLand Café & Cupcakeria','Estrada Caminho dos Açores, 1740 - Santo Antônio de Lisboa','Santo Antônio de Lisboa','(48) 3209-7462','@fairylandbakery','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato','Nathalia',false,false,null,null,null,'4.0'),
('2a8fa5d4-ac7e-574a-8175-1fd604d6bd51','O Padeiro de Sevilha (Centro)','R. Esteves Júnior, 214 - Centro','Centro','(48) 3025-3402','@opadeirodesevilla','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,true,'2026-06-15',null,'Número não estava no WhatsApp','5.0'),
('b7089f60-bb9a-59ef-b554-a323b25ab4f0','Amoriko Brigadeiros Finos','Rod. Baldicero Filomeno, 7227 - Ribeirão da Ilha','Ribeirão da Ilha','(48) 3234-0890','@amoriko.brigaderia','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'6.0'),
('d4d97bd5-e35b-5837-af02-400792d00eaf','Tens Tempo Café','Rod. Baldicero Filomeno, 7541 - Freguesia do Ribeirão','Freguesia do Ribeirão','(48) 3337-5711','@tenstempocafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','7.0'),
('e90e5acc-d2be-54aa-9ce2-c1e94610432c','Café Psiquê','R. Menino Deus, 63 - Bl A - Centro (Baía Sul Hospital)','Centro (Baía Sul Hospital)','(48) 99188-4133','@cafe_psique','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'8.0'),
('7306ad24-847a-507f-9f29-5d61a5ab01ce','Gelato Di Panna - Lagoa da Conceição','R. Manoel Severino de Oliveira, 620 - Loja 4 - Lagoa da Conceição','Lagoa da Conceição','(48) 98824-0751','@gelatodipanna','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'9.0'),
('d58358ef-8a6b-568e-9c51-01dc579bac75','Café Cultura - Lagoa da Conceição','R. Manoel Severino de Oliveira, 635 - Lagoa da Conceição','Lagoa da Conceição','(48) 3771-1861','@cafeculturabrasil','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','10.0'),
('ffacae68-0de8-5ef7-87af-777bd7869abe','Santo Appetito Bistrô & Café','R. Cônego Serpa, 30 - Santo Antônio de Lisboa','Santo Antônio de Lisboa','(21) 99696-0230','@santo.appetito','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-15','Retornar as 16:30',null,'11.0'),
('eccd034f-9c8a-5d79-82bf-bee065fe0b25','Leeds Café Store','Av. Afonso Delambert Neto, 14 - Lagoa da Conceição','Lagoa da Conceição','(48) 3207-1829','@leedscafestore','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','12.0'),
('0c528744-b5cd-5858-b324-8521f3a68735','Delícias da Freguesia','Rod. Baldicero Filomeno - Ribeirão da Ilha','Ribeirão da Ilha',null,'@deliciasdafreguesia','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'13.0'),
('2161d23e-5266-54f1-a1c0-dd7a19a72145','O Padeiro de Sevilha (Beiramar)','R. Des. Pedro Silva - Agronômica','Agronômica','(48) 3025-3402','@opadeirodesevilla','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','14.0'),
('0044406b-bd16-514d-a54d-0738ab245f90','Hang Out Coffee SPOT','R. Clodorico Moreira, 43 - Santa Mônica','Santa Mônica','(48) 3054-0640','@hangoutcoffeespot','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','15.0'),
('f9b0121b-5a62-542f-bcc4-65633bcaae97','Rocambole Café','R. Henrique Vera do Nascimento, 270 - Lagoa da Conceição','Lagoa da Conceição','(48) 3232-0858','@rocambolecafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'16.0'),
('7380714d-6d24-5a14-a4c9-1357d13a0eb7','Floripão (Porto / Rio Tavares)','Rod. Dr. Antônio Luiz Moura Gonzaga, 96 - Porto da Lagoa','Porto da Lagoa','(48) 3232-2425','@floripao.porto','1948d0dd-cc43-5c6b-bff1-4883dd942d44','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','17.0'),
('491184af-8ec5-545b-97c5-a02fe6813911','Bulegreen Café & Brunch','R. Des. Pedro Silva, 2649 - Coqueiros','Coqueiros','(48) 98836-6095','@bulegreenbr','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,'floripa@bulegreen.com','18.0'),
('c3bb275c-1e52-580a-b2f4-eee2b1aa8270','Bridge Coffee Estreito','R. Secundino Peixoto, 119 - Estreito','Estreito',null,'@bridgecoffee.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'19.0'),
('ba7d3f12-d125-5669-a3e9-e0c286f55fe3','Vícios e Virtudes Café','R. Me. Maria Villac, 1242 - Loja 4 - Canasvieiras','Canasvieiras','(48) 99225-6523','@viciosvirtudescafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'20.0'),
('72fa03a1-7911-54e2-a27e-af7df26972cf','Café Paçaí','Rod. Jornalista Manoel de Menezes, 2646 - Barra da Lagoa','Barra da Lagoa','(48) 3338-3841','@cafepacai','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','21.0'),
('86a0ce12-0c04-5a83-9f29-b6fca080832e','Family Coffee','Av. Me. Benvenuta, 1157 - Santa Mônica','Santa Mônica','(48) 3024-8413','@familycoffeebr','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','22.0'),
('61b471f0-4ce8-5d35-9a7b-783d209be6ea','ARBOR Café','Florianópolis - SC','SC',null,'@arbor.cafe','c52640de-ec41-5c26-97de-4fc81d8f6c1e','sem_contato',null,false,false,null,null,null,'23.0'),
('453c326e-c3cc-5c44-ab68-59f38b2c0ce4','Cine Café - Crepe Burguer Steak','Florianópolis - SC','SC',null,'@cinecafefloripa','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','sem_contato',null,false,false,null,null,null,'24.0'),
('ad18a67a-091d-56be-937c-0b126c2360c5','Uma Origem Coffee','Av. Mauro Ramos, 1512 - Centro','Centro','(48) 99143-0611','@umaorigemcoffee','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','25.0'),
('741c034a-ec4a-55f9-b4d9-a4ca5a0feddf','Família Lorenzi Pães Artesanais','Florianópolis - SC','SC',null,'@familialorenzipao','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'26.0'),
('3923edd0-6aa5-576e-9b6f-e74ab04349e9','Empório Mineiro','R. Henrique Veras do Nascimento, 240 - Loja 102 - Lagoa da Conceição','Lagoa da Conceição','(48) 3232-0931','@emporio_mineiro_bar','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','27.0'),
('4cb79560-8985-5297-87c8-8673d1abd034','Lucila Bistrô','Alameda César Nascimento, 322 - Jurerê','Jurerê','(48) 3204-4603','@lucilabistro','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','28.0'),
('e05df52c-4a8f-5dea-9034-6d1f870e73d5','Padaria Do Alemão (Alemão Café & Pães)','R. Conselheiro Mafra, 707 - Centro','Centro','(48) 3225-5991','@alemaocafeepaes','ef3be889-0994-57f5-9665-c3e04d1fc4ce','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','29.0'),
('c00cc529-1363-5b7a-8084-8ba7705e154d','Da Praça - Restaurante e Cafeteria','R. Felipe Schmidt, 14 - Centro (Praça XV)','Centro (Praça XV)','(48) 3380-0657','@dapracafloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'30.0'),
('293c3b6e-1dca-57ef-aabb-c8a04dd1f465','Café Paris Rita Maria','Anitta Hoepcke da Silva, 112, Galpão 6 - Loja 16 - Armazém Rita Maria','Armazém Rita Maria','(48) 99615-2224','@cafeparisritamaria','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'31.0'),
('07d04c12-f427-5d37-94c0-1e279e92fdee','Brulée Cafeteria & Doces Gourmet','R. Dr. Agostinho Sielski, 134 - Santa Mônica','Santa Mônica','(48) 98807-8220','@brulee.doceriagourmet','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'32.0'),
('9e630d4b-a23b-524d-9ebf-0cf8123a2b2a','Garapuvu Café & Bistrô','Rod. Admar Gonzaga, 600 - Itacorubi (Mercure Florianópolis)','Itacorubi (Mercure Florianópolis)','(48) 3231-1720','@garapuvucafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'33.0'),
('3708227d-193f-5998-bb42-6f57dba8bd06','Metrô Cafés Especiais','Av. Pref. Osmar Cunha, 251 - Loja 2 - Centro','Centro','(19) 99304-6687','@metrocafes','1948d0dd-cc43-5c6b-bff1-4883dd942d44','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','34.0'),
('b3f9df8a-1eef-5d4f-b6f4-f3a1a12cbdf9','Typica Florianopolis','R. Juvêncio Costa, 98 - Trindade','Trindade','(48) 98824-2241','@typica.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'35.0'),
('bed5708b-d594-521e-93ef-e46264d74d18','Cafeteria Cheirin Bão - Centro','R. Felipe Schmidt, 21 - Loja 2 - Centro','Centro','(48) 99865-2733','@cheirinbao','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','frio','Nathalia',false,false,'2026-06-12',null,null,'36.0'),
('50ed735a-9ba6-5128-a0a3-c1ac4f665512','BeneCafé','Av. Trompowsky, 355 - Centro','Centro','(48) 99665-2233','@benecafeoficial','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,'Falaram que tudo fica encargo da contabilidade','37.0'),
('aebddd25-34d0-5972-a95b-ea10f4eb4bd8','Café Cultura - Beiramar Shopping','R. Bocaiúva, 2468 - Centro (Beiramar Shopping)','Centro (Beiramar Shopping)','(48) 99142-9331','@cafeculturabrasil','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','38.0'),
('79bb36ef-d2e9-55cc-b2cd-e58c92bc43fe','The Seville Baker','R. Esteves Júnior, 214 - Centro','Centro','(48) 3025-3402','@thesevillebaker','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','39.0'),
('5aa2f1f6-4c02-5eab-86cf-ca139cacee97','Streetme Coffee','Calçadão João Pinto, 17 - Loja 01 - Centro','Centro',null,'@streetme.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'40.0'),
('86e5a892-fe8f-5b92-97f4-3e4524d45af8','Café Decor','R. Ver. Osni Ortiga, 949 - Lagoa da Conceição','Lagoa da Conceição','(48) 3207-9907','@cafedecor.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'41.0'),
('e9be071e-3756-5ba3-a5fc-a1ccc5c34546','Love''s Café','Ed Top Tower - R. Esteves Júnior, 50 - Centro','Centro','(48) 99209-4242','@lovescafe.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'42.0'),
('60f73dda-c3d8-585a-b797-d2499b277592','Café Escondido - Casa Múltiplas','Av. Pref. Osmar Cunha, 339 - 1º andar - Centro','Centro',null,'@cafeescondido','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'43.0'),
('fa74914c-dc1e-5a9f-acb5-ea193fa450cb','Café Céret - Pâtisserie Francesa','R. Visc. de Ouro Preto, 282 - Centro (Aliança Francesa)','Centro (Aliança Francesa)','(48) 98836-4191','@cafeceret','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'44.0'),
('8af7216b-c715-52a6-8367-a04434178113','Somos Aroma Café','R. Dep. Antônio Edu Vieira, 679 - Pantanal','Pantanal','(48) 98415-3482','@somosaromacafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-15',null,null,'45.0'),
('e8313437-3a9f-50ec-8147-5095669062e2','Nas Ondas Café - Matriz','Av. Campeche, 1512 - Loja 3 - Campeche (Páteo Campeche)','Campeche (Páteo Campeche)','(48) 99983-0666','@nasondascafe','c52640de-ec41-5c26-97de-4fc81d8f6c1e','frio','Nathalia',false,false,'2026-06-12',null,null,'46.0'),
('f276be2c-82cb-5a90-a3e4-e85ebde18177','Café Sunrise, Restaurante & Wine Bar','R. Henrique Vera do Nascimento, 240 - Sala 101/102 - Lagoa da Conceição','Lagoa da Conceição','(48) 3748-0597','@cafesunrise.lagoa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','47.0'),
('7d2f2122-2689-52b9-af99-0da96e865c5e','Favo Floripa','R. Des. Pedro Silva, 3078 - Coqueiros','Coqueiros','(48) 98457-6220','@favofloripa','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','frio','Nathalia',false,false,'2026-06-12',null,null,'48.0'),
('9894980a-2dba-5f64-8f25-c0786a4e5c7f','Jardins Cafeteria','Florianópolis - SC','SC','(48) 98804-6628','@jardinscafeteria','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'49.0'),
('465f49d8-b2d9-5c2c-9bc7-038853149585','Messkla Cafeteria','Av. Afonso Delambert Neto, 885 - Lagoa da Conceição','Lagoa da Conceição',null,'@messkla','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'50.0'),
('aa392107-2041-588e-8f61-f486a6d25e20','Café Paris Centro','Av. Osmar Cunha, 106 - Galeria Irmãos Daux - Centro','Centro','(48) 3039-0670','@cafepariscentro','1948d0dd-cc43-5c6b-bff1-4883dd942d44','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','51.0'),
('8f06633b-05f0-53d5-80ec-c037360cc3eb','Café na Praia Campeche','Av. Pequeno Príncipe, 3328 - Campeche','Campeche','(48) 98880-4711','@cafenapraia.campeche','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'52.0'),
('13a403df-0e1c-5aef-a06c-a15c69f1ebf7','Meninas de Minas Café, Pão de Queijo e Empório','Av. Pequeno Príncipe, Serv. Arvoredo, 2700 - Loja 3 - Campeche','Campeche','(48) 99130-3081','@meninasdeminascafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,'Mãe e filhos','53.0'),
('d4f0079b-d44e-5eb0-bf67-2a1e880e6b7e','Coffeeshop Floripa','R. Manoel Severino de Oliveira, 592 - Lagoa da Conceição','Lagoa da Conceição',null,'@coffeeshopfloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'54.0'),
('17fda06d-8230-550c-a9d6-f38dcc9ff19e','CORA MELO Café','R. Santa Luzia, 100 - Loja 01 - Trindade','Trindade',null,'@coramelocafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'55.0'),
('b36ce326-f643-5e19-9e31-7bd49d5f9eba','Café e Poesia Canasvieiras','R. Hypólito Gregório Pereira, 161 - Canasvieiras','Canasvieiras',null,'@cafeepoesia','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'56.0'),
('2730b653-8428-511c-ac2d-0ba672e962af','Café Monet - Canasvieiras','Av. das Nações, 265 - Canasvieiras','Canasvieiras',null,'@cafemonet.canasvieiras','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'57.0'),
('e0af5288-a903-5081-b183-df56752edf13','Floripa Bistrô Cafeteria','R. Dr. Antonio Prudente de Morais, 538 - Loja 6 - Canasvieiras','Canasvieiras',null,'@floripabistro','ef3be889-0994-57f5-9665-c3e04d1fc4ce','sem_contato',null,false,false,null,null,null,'58.0'),
('362a0931-3779-5833-9877-4db230c44787','Zephyr Café Brasil','Rod. João Gualberto Soares, 56 - Sala 7 - Cacupé','Cacupé','(48) 99203-4828','@zephyrcafebrasil','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'59.0'),
('5e12fea3-80be-5240-8ecc-d36024749c8b','Ilha Café','Rod. Armando Calil Bulos, 3150 - Pântano do Sul','Pântano do Sul',null,'@ilhacafe.floripa','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','sem_contato',null,false,false,null,null,null,'60.0'),
('f0391518-8c38-53be-b733-e66976ca299d','Casa Calma Café, Pizza & Bar','Rod. Baldicero Filomeno, 5615 - Ribeirão da Ilha','Ribeirão da Ilha',null,'@casacalma.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'61.0'),
('a7176070-db0e-5e61-a082-30b87853b23c','Akitutes Café e Confeitaria','Florianópolis - SC','SC',null,'@akitutes_confeitaria','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'62.0'),
('1dfbf5fa-798d-5fcb-87b4-f1773f2cdc0f','Merci Bakery & Coffee','R. Felipe Schmidt, 1066 - Centro','Centro','(48) 98816-6854','@mercifloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'63.0'),
('1552f6a7-b056-573a-b643-bb61ac6ded75','Delícias do Campo','Rod. SC-401, 4230 - Saco Grande','Saco Grande','(48) 3206-3223','@deliciasdocampofloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','64.0'),
('bd505b78-aaae-5d25-af28-67d2e104c612','Mokka Floripa','Av. Cláudio A. Barbosa, 1917 - Estreito','Estreito','(48) 3204-4701','@mokka.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12','Responsável só chega depois das 17:30',null,'65.0'),
('15470f95-f016-5e66-a22a-d246111fe82c','Boutique Café François','Florianópolis - SC','SC',null,'@boutiquefrancois','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'66.0'),
('d80542d8-0e4e-553f-979c-18274dc911a1','Starbucks Florianópolis','Shopping Beira Mar / Iguatemi, Florianópolis - SC','SC',null,'@starbucks_br','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'67.0'),
('482d85c7-90a3-534e-b87d-d13dd51e2975','Porto 1922 Cafeteria & Bistrô','Av. Cláudio A. Barbosa, 3761 - Estreito','Estreito',null,'@porto1922.floripa','1948d0dd-cc43-5c6b-bff1-4883dd942d44','sem_contato',null,false,false,null,null,null,'68.0'),
('666c3895-8729-5e57-a1b0-d4262db27783','Confraria do Grão','R. Felipe Schmidt, 636 - Sala 12 - Centro','Centro','(48) 3207-8200','@confrariadograo','c52640de-ec41-5c26-97de-4fc81d8f6c1e','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','69.0'),
('44e92ff2-6e23-5e5a-9001-82765835ba96','Padaria e Confeitaria Estrela','Norte da Ilha, Florianópolis - SC','SC',null,'@padariaestrela.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'70.0'),
('689951ab-673b-581d-9f86-6183b83e3590','Café da Lagoa','Lagoa da Conceição, Florianópolis - SC','SC',null,'@cafedaLagoa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'71.0'),
('0063e2d2-221c-543b-b821-56782438ee4f','Krone Café & Padaria','Rod. Baldicero Filomeno, 6321 - Ribeirão da Ilha','Ribeirão da Ilha','(48) 3238-8739','@kronecafe.floripa','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','72.0'),
('c3fef054-f198-5495-a6f3-0f0e5b1cc3a4','Tekapo - Art of Brunch','Av. Campeche, 2565 - Campeche','Campeche','(48) 99800-2035','@tekapo.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'73.0'),
('fbe8bc06-855a-5d35-b57f-d8a77ff436ea','Cafeína Café Bistrô','Av. Campeche, 37 - Campeche Leste','Campeche Leste','(48) 3030-0095','@cafeina.bistro','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'74.0'),
('538e943c-540f-538b-841c-76212f909eeb','Café Cacupé (Coffee Cacupe)','Estrada Haroldo Soares Glavan, 5800 - Cacupé','Cacupé','(48) 99823-0694','@coffeecacupe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'75.0'),
('d98e9161-1d8a-564e-b07b-400688bec30b','Chez Cris Café Bistrô','R. Presidente Coutinho, 652 - Centro','Centro','(48) 3371-6830','@chezcriscafebistro','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','76.0'),
('93c016ec-5f43-5e53-84ae-4fd40a1fee98','Paradiso Mercato e Caffè','Av. Campeche, 2829 - Campeche','Campeche','(48) 98846-8302','@paradiso.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'77.0'),
('7b787dc0-9f11-5e95-9161-b1410bcb7eb4','Taipei Coffee House','Estrada Haroldo Soares Glavan, 3010 - Cacupé','Cacupé','(48) 98500-8964','@taipeicoffeehouse','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'78.0'),
('66d8f4ec-2dcd-523b-baa0-d39c55e79073','Amore Bistrot','SC-401, 5025 - Saco Grande','Saco Grande','(48) 3304-8307','@amorebistrot.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','79.0'),
('514e1948-c6bb-5521-be59-a3b24cad4231','Eatsy','Florianópolis - SC','SC',null,'@eatsy.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'80.0'),
('e1c3b1bb-8c9e-5ef5-abdf-a959912bc456','Bolo da Madre Florianópolis','R. Des. Arno Hoeschl, 81 - Loja 2 - Centro','Centro','(48) 99182-5070','@bolodamadrefloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','81.0'),
('8f0b72d3-56e5-5684-aa99-e7ca81427d6d','Beja Café','Florianópolis - SC','SC',null,'@bejacafe.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'82.0'),
('a95305cd-865c-522a-96b2-3d49856f497c','Casa de Chá Mayra Pauli','Av. Me. Benvenuta, 687 - 2º Andar - Villa Romana','Villa Romana','(48) 99915-4767','@casadechamayrapauli','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'83.0'),
('8af58282-e873-51bd-a6b0-711e8842ae26','Ánomada','Servidão dos Artistas, 30 - Rio Tavares','Rio Tavares','(48) 98843-8819','@anomada__','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','frio','Nathalia',false,false,'2026-06-12',null,null,'84.0'),
('8b76a551-ebba-5418-af4d-71bd92fb6c0d','Café da Bica','R. Cap. Romualdo de Barros, 641 - Carvoeira','Carvoeira','(48) 99675-5339','@cafedabica','1948d0dd-cc43-5c6b-bff1-4883dd942d44','frio','Nathalia',false,false,'2026-06-12',null,null,'85.0'),
('2c518a57-8af6-5e6b-9a7d-021c76d9f260','Deli Shop','Centro, Florianópolis - SC','SC',null,'@delishopfloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'86.0'),
('01b9b07c-748f-51b1-a5fd-2b042f03bac2','Grão & Pronto','R. Vidal Ramos, 120 - Centro','Centro','(48) 99988-0169','@graoeprontocafe','ef3be889-0994-57f5-9665-c3e04d1fc4ce','frio','Nathalia',false,false,'2026-06-12',null,null,'87.0'),
('fc9fd0e7-9152-5df1-ba33-6d505946b831','Lighthouse Cafés Especiais','R. São Jorge, 160 - Centro','Centro','(48) 3054-2113','@lighthousecafes','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','88.0'),
('2715bc5e-0fe6-5c82-b182-bdf0b4fb68ee','Sereno Café','R. Esteves Júnior, 734 - Box 01 - Centro','Centro',null,'@serenocafe.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'89.0'),
('1fe883bb-61e6-5bfc-925c-122eab1c4c42','Café do Mirante','Rod. João Gualberto Soares, 1.747 - Loja 4 - Barra da Lagoa','Barra da Lagoa','(48) 99162-4507','@cafedomirantefloripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'90.0'),
('83858b6b-9edd-5224-8241-bfefcd28e22f','Bonjour Padaria Artesanal','São José - SC (próx. Florianópolis)','SC (próx. Florianópolis)','(48) 99697-3965','@bonjour_padariaartesanal','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'91.0'),
('b9438376-b918-5ad1-a463-0f1d951fa73d','Biscookies Café','R. Intendente João Nunes Vieira, 1715 - Centro Comercial Alvorada - Ingleses','Ingleses','(48) 99192-1923','@biscookiescafe','c52640de-ec41-5c26-97de-4fc81d8f6c1e','frio','Nathalia',false,false,'2026-06-12',null,null,'92.0'),
('2eed7f95-97f3-57d8-8547-b15e3b0b3f90','Empório Dom Casmurro','Av. Prof. Othon Gama D''Eça, 900 - Loja 02 - Beira Mar','Beira Mar','(48) 99175-4066','@emporiodomcasmurro','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'93.0'),
('31317135-205a-5606-a556-1da6b88f5a31','Quiero Café','R. Dom Jaime Câmara, 118 - Centro','Centro','(48) 98876-1056','@quiero.cafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'94.0'),
('6ed67a11-70e8-5ad9-af8e-8ceb5093e972','Aurora Café e Bistrô','R. Leonel Pereira, 78 - Sala 09 - Cachoeira do Bom Jesus','Cachoeira do Bom Jesus',null,'@auroracafe.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'95.0'),
('61fe87a9-f25a-57c8-b4c0-e47bc28d44d6','Café du Centre','Tv. Stodieck, 34 - Centro','Centro','(48) 3364-1030','@cafeducentre.floripa','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','sem_contato',null,false,false,null,null,'Número não estava no WhatsApp','96.0'),
('c93718d0-baed-5047-b541-c5c2307a070b','Franchis Padaria Argentina','Av. César Seara, 174 - Saco dos Limões','Saco dos Limões',null,'@franchispadaria','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'97.0'),
('e22251b6-e6a5-5515-82b6-2239320daa5b','Santo Trigo Padaria & Cafeteria','Serv. das Caliandras, 59 - São João do Rio Vermelho','São João do Rio Vermelho','(47) 99790-2391','@santotrigo.floripa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio','Nathalia',false,false,'2026-06-12',null,null,'98.0'),
('98fccdc9-7b8c-5115-a34e-cf8a98c2f544','440 Bebida Café','Av. Central, 184 - Centro, Balneário Camboriú - SC','SC','(47) 3363-9747',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'101.0'),
('05f5ec40-c423-5bbe-81ba-4670b2ad95e5','D''Mell Café','Av. Brasil, 577 - Sala 01, Balneário Camboriú - SC','SC','(47) 3344-5819','@dmellcafebc','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'102.0'),
('0312d467-eade-5eee-a49e-d1b90fbe0bf1','Boutique do Pão de Ló BC','Rua 916, 369 - Centro, Balneário Camboriú - SC','SC','(47) 99186-7796','@boutiquedopaodelo','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'103.0'),
('7c315fd4-8b4a-5a14-bb45-29bfa21231c7','Black Box Coffee','Av. Carlos Drummond de Andrade, 631 - Praia dos Amores, Balneário Camboriú - SC','SC','(47) 99258-1850',null,'1948d0dd-cc43-5c6b-bff1-4883dd942d44','sem_contato',null,false,false,null,null,null,'104.0'),
('0d64248a-146b-587c-a3c4-43e681acce61','Lisboa Café','Rua 1542, 860 - 3ª Avenida, Centro, Balneário Camboriú - SC','SC',null,'@lisboacafe3av','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'105.0'),
('69850b7f-979f-5f35-9416-03ccdc991acd','Italiana Garden Café','R. Olímpio Miranda Júnior, 165 - Centro, Itajaí - SC','SC','(47) 3011-9206','@italianagardencafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'106.0'),
('3ece21ef-8f48-5177-a310-5c2cbac3eedd','Lumière Café','R. Delfim de Pádua, 1128 - Praia Brava, Itajaí - SC','SC',null,'@lumierecaffe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'107.0'),
('e54a0d55-389c-5e20-b945-941db632beeb','Cafeeira Garibaldi','Av. Osvaldo Reis, 2935 - Praia Brava, Itajaí - SC','SC','(47) 3349-5569','@garibaldicafeeira','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'108.0'),
('1dd36d59-a6c4-570b-9100-1b0dad51b7b1','Boutique do Pão de Ló Itajaí','Rua Lauro Müller, 487 - Centro, Itajaí - SC','SC','(47) 99186-7796','@boutiquedopaodelo','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'109.0'),
('1e6edc98-6a02-5663-9056-9b420bb95b19','Teor Bistrô & Café','Rua 254, 117 - Meia Praia, Itapema - SC','SC','(47) 99711-6165','@teorbistroecafe','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','sem_contato',null,false,false,null,null,null,'110.0'),
('073bda3f-79ca-5d59-bdd2-2defda8b8d82','Café Boutique','Av. Nereu Ramos, 3605 - Centro, Itapema - SC','SC','(47) 99249-7336','@cafeboutique.itapema','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'111.0'),
('0420244a-a48b-524e-9d0f-f3c64904c09c','Boutique do Pão de Ló Itapema','Rua 296, 20 - Sala 13, Meia Praia, Itapema - SC','SC','(47) 99186-7796','@boutiquedopaodelo','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'112.0'),
('1225ca48-6e30-574b-a582-5b4a78d2daff','Secretto Café','R. Aquidaban, 786 - América, Joinville - SC','SC','(47) 98869-4666','@secrettocafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'113.0'),
('b7588a53-bb87-5e37-8ec3-3a47b08522bb','AP! Café Retrô','R. Min. Calógeras, 840 - Centro, Joinville - SC','SC','(47) 3028-3810','@apcaferetro','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'114.0'),
('cbd921ba-bc57-5e9d-90cd-c8252394af2c','Dona Francisca Delicatesse','R. Alexandre Döhler, 190 - Centro, Joinville - SC','SC','(47) 98807-7887','@donafranciscacafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'115.0'),
('9c742a3c-e371-5950-9e85-ac870f0b013d','Funberry Lounge Café','R. Jaguaruna, 315 - Centro, Joinville - SC','SC','(47) 99102-0315','@funberrycafejoinville','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'116.0'),
('b18d47df-b669-59f0-a51d-f6de1e1620c8','Cafeteria Rigno','R. Siqueira Campos, 1720 - Candeias, Vitória da Conquista - BA','BA','(77) 98145-5213','@cafeteriarigno','c52640de-ec41-5c26-97de-4fc81d8f6c1e','sem_contato',null,false,false,null,null,null,'117.0'),
('393cf3c9-f32e-5299-ae54-7b527a9191cc','Morioka Café','Av. Jorge Teixeira, 602B - Candeias, Vitória da Conquista - BA','BA',null,'@moriokacafe','ef3be889-0994-57f5-9665-c3e04d1fc4ce','sem_contato',null,false,false,null,null,null,'118.0'),
('93737bb3-2407-574b-affd-2b81ff42b671','Jardins Café','Av. Olívia Flores, 704 - Candeias, Vitória da Conquista - BA','BA','(77) 98141-8652','@jardinscafevca','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'119.0'),
('e4d302bc-6c77-5199-b570-a2eb6f70de51','Confeitaria Amorim','Av. Perimetral (Praça São Bento), Vitória da Conquista - BA','BA',null,'@confeitaria_amorim','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'120.0'),
('2a2cc9ca-900c-56bd-8b59-0a44c60e6fe6','Caracol Chocolates & Café','Av. Brasil, 8 - Candeias, Vitória da Conquista - BA','BA',null,'@caracol.vitoriadaconquista','1948d0dd-cc43-5c6b-bff1-4883dd942d44','sem_contato',null,false,false,null,null,null,'121.0'),
('ff594959-8e09-5609-bfc6-3541840468a4','Canto do Galo Café','R. Belarmino Maia, 63 - Vitória da Conquista - BA','BA','(77) 98822-3994','@cantodogalocafe','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','sem_contato',null,false,false,null,null,null,'122.0'),
('e6d88bae-7139-5a6c-99fb-6414d20555aa','Cafélier','R. do Carmo, 50 - Santo Antônio, Salvador - BA','BA','(71) 99914-1270','@cafeliercarmo','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'123.0'),
('cbb4ce42-4690-5003-b51a-29d7b17c760f','Seven Wonders Café','Av. Oceânica, 859 - Barra, Salvador - BA','BA','(71) 99663-4278','@sevenwonderscafe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'124.0'),
('fb4c371a-0728-50ed-9141-7c0c975ebf99','Solange Café','R. da Paz, 18 - Graça, Salvador - BA','BA','(71) 3565-5211','@solangecafe_','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'125.0'),
('d8bd1fb6-16cf-536e-9dac-84573376fa0d','Café & Câmera','R. do Carmo, 1 - Santo Antônio Além do Carmo, Salvador - BA','BA',null,'@cafeecamera','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'126.0'),
('938e10f3-7fcb-5ceb-9839-7af36fc9af43','D''Gregorio','Av. Antônio Carlos Magalhães, 1298, loja 03A - Itaigara (Shopping Cidade), Salvador - BA','BA','(71) 98225-0990','@dgregoriosalvador','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'127.0'),
('c212e76e-9d09-52b2-8ad6-ecfd1060a25a','Café Padoca do Carmo','R. do Carmo, 13 - Santo Antônio Além do Carmo, Salvador - BA','BA','(71) 99179-8196','@padocadocarmo','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'128.0'),
('03529169-9024-53e0-98de-62ec45ad2ed6','London Coffee Station',null,null,'(11) 930991094',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','sem_contato',null,false,false,null,null,null,'129.0'),
('98460a0c-eb07-54f6-95b9-bfbfa054bd8b','Quintal 59',null,null,'(11) 988377272',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio',null,false,false,null,null,null,'130.0'),
('cc77af72-8539-56c2-8619-31e8771ec4b4','Coffee Lab',null,null,'(11) 991488052',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio',null,false,false,null,null,null,'131.0'),
('53d0c091-1f95-5b5d-ae7b-52396868fd0f','Art Café 2.0 Bistrô',null,null,'(34) 99812-1055',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio',null,false,false,null,null,null,'132.0'),
('e92787e4-a10a-52e3-a54e-6696932bfea4','Cafeteria Vila Rica',null,null,'(47) 992840344',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio',null,false,false,null,null,null,'133.0'),
('001cace6-f0ae-5608-be9c-7677285cc30e','Merci Bakery & Coffee',null,null,'(48) 988166854',null,'ee59e5dc-f871-5187-9cb6-f769b03dd9f6','morno',null,false,false,'2026-06-13','Follow up, marcar reunião','Empresa familiar (mãe = financeiro)','134.0'),
('e01d5706-c209-53e6-9155-cca991c17ade','Mathy Café Balneário camburiú',null,null,'(47) 991742024',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio',null,false,false,null,null,null,'135.0'),
('192c49dd-d372-5fa8-ae8b-2453f042c16b','Itapanni',null,null,'(47) 33684411',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio',null,false,false,null,null,null,'136.0'),
('7b800e9b-db6e-58a8-b9be-c23d9ef5ac40','440 Bebida Café',null,null,'(47) 997540379',null,'84043611-274c-5fbc-9c5f-cf8bf7fd12a6','frio',null,false,false,null,null,null,'137.0'),
('24de39de-71e2-5581-b791-2ea0816dc6be','Boutique do pão de ló- bc',null,null,'(47) 99186-7796',null,'1948d0dd-cc43-5c6b-bff1-4883dd942d44','frio',null,false,false,null,null,null,'138.0');

-- ---------- Oportunidades (1 por conta) ----------
insert into oportunidades (id,conta_id,canal_id,estagio,valor_mrr,probabilidade,data_entrada_estagio,responsavel) values
('b4644ebf-09f5-50ef-9820-0b7b2f444b12','ea0fe8e3-d9ac-5541-928f-c4b02645070d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('bb147117-11d9-5dff-bd33-66685f6e12a4','d674f51a-2373-533b-848b-fc28b22f76c0','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('0a44af8c-713d-5af2-93cc-539f520185dd','62fbab58-adfa-5ee3-995c-74287c883cb5','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('8564ebde-cc53-5237-8259-63098c057762','45b5108e-7805-5528-946c-7d20017f6bf7','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16','Nathalia'),
('817ce040-01a4-5439-8af5-a3471ccbb7a9','2a8fa5d4-ac7e-574a-8175-1fd604d6bd51','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-15','Nathalia'),
('958f1002-b0a4-5dda-a453-8307efca12c4','b7089f60-bb9a-59ef-b554-a323b25ab4f0','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('8e377830-f8ea-5471-8b52-4b3d4cbe2e95','d4d97bd5-e35b-5837-af02-400792d00eaf','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('6d8fe97d-2ffa-5cf7-aeca-2b3cb69d2771','e90e5acc-d2be-54aa-9ce2-c1e94610432c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('6fd874b0-88cd-56e2-992d-761b406265aa','7306ad24-847a-507f-9f29-5d61a5ab01ce','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('3321e371-3668-55a4-a24d-a8d1868a3ddd','d58358ef-8a6b-568e-9c51-01dc579bac75','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('ff500060-ff56-55f3-96b8-e6e7be5c77ab','ffacae68-0de8-5ef7-87af-777bd7869abe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-15','Nathalia'),
('b84a24f4-550c-504c-95eb-d3c04a9ccb88','eccd034f-9c8a-5d79-82bf-bee065fe0b25','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','cadastrado',250,5,'2026-06-16',null),
('31f6a8c4-0a35-539e-963e-c0b4257063b0','0c528744-b5cd-5858-b324-8521f3a68735','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('6c6ba6c7-737a-52d1-99ab-5c3964018446','2161d23e-5266-54f1-a1c0-dd7a19a72145','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('ccc50fbd-7786-5eb6-9baf-c759c8444809','0044406b-bd16-514d-a54d-0738ab245f90','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('ac7da2a0-c399-521b-a54f-f7eb29a1255b','f9b0121b-5a62-542f-bcc4-65633bcaae97','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('b4d7b4dd-a9d6-5b94-9537-b018815b55ef','7380714d-6d24-5a14-a4c9-1357d13a0eb7','1948d0dd-cc43-5c6b-bff1-4883dd942d44','cadastrado',250,5,'2026-06-16',null),
('2bcef3d7-7da0-5878-810d-0c3539b4576d','491184af-8ec5-545b-97c5-a02fe6813911','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('d7a26d0b-aae1-54fc-9ad1-4c7adc9b06a7','c3bb275c-1e52-580a-b2f4-eee2b1aa8270','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('6ce10117-91f9-5c3d-9ce3-b04dffd8b2d1','ba7d3f12-d125-5669-a3e9-e0c286f55fe3','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('84a7cf95-380d-586b-9715-26da4aedf024','72fa03a1-7911-54e2-a27e-af7df26972cf','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('bf7b0e11-3cda-5e12-84b4-60451235103d','86a0ce12-0c04-5a83-9f29-b6fca080832e','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('0a945667-6741-52c2-a2cb-51dde0c1b52e','61b471f0-4ce8-5d35-9a7b-783d209be6ea','c52640de-ec41-5c26-97de-4fc81d8f6c1e','cadastrado',250,5,'2026-06-16',null),
('05f80070-9df8-525c-87eb-9f306a70d21b','453c326e-c3cc-5c44-ab68-59f38b2c0ce4','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','cadastrado',250,5,'2026-06-16',null),
('b62260e7-b8c3-51a5-b298-be48a9755735','ad18a67a-091d-56be-937c-0b126c2360c5','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('94ff1f86-3585-5064-9924-031da303deaf','741c034a-ec4a-55f9-b4d9-a4ca5a0feddf','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('a8f13418-c8f5-5aba-ad52-e595feda9a2d','3923edd0-6aa5-576e-9b6f-e74ab04349e9','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('6bf003cd-4bc8-53a2-a709-d2de62950831','4cb79560-8985-5297-87c8-8673d1abd034','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('bc48fa0c-3ac2-5c7b-bc57-7772bc7a91da','e05df52c-4a8f-5dea-9034-6d1f870e73d5','ef3be889-0994-57f5-9665-c3e04d1fc4ce','cadastrado',250,5,'2026-06-16',null),
('771ced4f-dcd3-5a5a-8f1c-75b455f7198f','c00cc529-1363-5b7a-8084-8ba7705e154d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('34a15551-a2c9-57c5-80d6-0259d1fe0092','293c3b6e-1dca-57ef-aabb-c8a04dd1f465','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('977c189f-e4c0-5bb5-91b7-3fd212e6e75e','07d04c12-f427-5d37-94c0-1e279e92fdee','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('6637dc56-9b5e-5c2e-b9a6-a53e3fd38a33','9e630d4b-a23b-524d-9ebf-0cf8123a2b2a','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('4a3244a4-7532-51e8-b789-05cd6bb30726','3708227d-193f-5998-bb42-6f57dba8bd06','1948d0dd-cc43-5c6b-bff1-4883dd942d44','cadastrado',250,5,'2026-06-16',null),
('0acc6f1c-0040-5feb-ba95-49e7215a3613','b3f9df8a-1eef-5d4f-b6f4-f3a1a12cbdf9','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('3ee249bf-6829-5b32-8826-271d3e113c7f','bed5708b-d594-521e-93ef-e46264d74d18','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','contatado',250,10,'2026-06-12','Nathalia'),
('1d96b01d-9bf2-5ad0-b739-e7dd7c24b51a','50ed735a-9ba6-5128-a0a3-c1ac4f665512','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('681a3ac3-b6ff-5014-a2d0-f821d0b49119','aebddd25-34d0-5972-a95b-ea10f4eb4bd8','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('5597b5c1-fabe-5130-834d-8f5e5c77ad3a','79bb36ef-d2e9-55cc-b2cd-e58c92bc43fe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('37116a3d-8a63-5e42-8da7-b5bfc5236563','5aa2f1f6-4c02-5eab-86cf-ca139cacee97','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('101cfcf1-8ca5-505a-8b32-fffc00b4de20','86e5a892-fe8f-5b92-97f4-3e4524d45af8','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('14359b76-288f-56cb-97ea-593ba2630cbb','e9be071e-3756-5ba3-a5fc-a1ccc5c34546','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('27d33e15-b991-5031-ac83-09211285cfdd','60f73dda-c3d8-585a-b797-d2499b277592','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('134218d7-eab0-5c28-b45b-c55f481f1d33','fa74914c-dc1e-5a9f-acb5-ea193fa450cb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('a60cf1c2-a597-51df-bc89-b64d2c8b9bc9','8af7216b-c715-52a6-8367-a04434178113','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-15','Nathalia'),
('668fa291-19c3-5571-ac16-a5b4923b4d18','e8313437-3a9f-50ec-8147-5095669062e2','c52640de-ec41-5c26-97de-4fc81d8f6c1e','contatado',250,10,'2026-06-12','Nathalia'),
('ca7dc515-757f-5af8-a899-879cdaa4bbe7','f276be2c-82cb-5a90-a3e4-e85ebde18177','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('d53853d6-ecdb-5054-8c56-d6d1c0a340a7','7d2f2122-2689-52b9-af99-0da96e865c5e','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','contatado',250,10,'2026-06-12','Nathalia'),
('b65f8f6d-c04a-53bd-b2ac-90ab1a2a2682','9894980a-2dba-5f64-8f25-c0786a4e5c7f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('cbf1d692-dfe9-50c7-b4fc-47e6dea9716a','465f49d8-b2d9-5c2c-9bc7-038853149585','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('8ded1e98-ee2b-539b-98e4-ffc7257f375d','aa392107-2041-588e-8f61-f486a6d25e20','1948d0dd-cc43-5c6b-bff1-4883dd942d44','cadastrado',250,5,'2026-06-16',null),
('9b115181-e93f-5dd0-bcba-0d1a081f93dd','8f06633b-05f0-53d5-80ec-c037360cc3eb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('47012fbc-4f71-54cc-b1ac-a8815f0bb519','13a403df-0e1c-5aef-a06c-a15c69f1ebf7','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('deb0db10-3349-5982-b8b4-c1c71e7a0f60','d4f0079b-d44e-5eb0-bf67-2a1e880e6b7e','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('98023e4a-5714-561c-b875-64d5f89d4c81','17fda06d-8230-550c-a9d6-f38dcc9ff19e','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('7536ecd3-4cf7-5eb6-be45-fe44a5256268','b36ce326-f643-5e19-9e31-7bd49d5f9eba','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('a80c9432-2009-5b6e-8175-bbc12bf5bf0d','2730b653-8428-511c-ac2d-0ba672e962af','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('8f55edb7-519d-503b-9594-4d7c5ba6ed29','e0af5288-a903-5081-b183-df56752edf13','ef3be889-0994-57f5-9665-c3e04d1fc4ce','cadastrado',250,5,'2026-06-16',null),
('85f3932f-4884-54f4-86ba-1a51491a0e6c','362a0931-3779-5833-9877-4db230c44787','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('55cae7ba-3088-5541-8a30-a9c396221d86','5e12fea3-80be-5240-8ecc-d36024749c8b','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','cadastrado',250,5,'2026-06-16',null),
('c6942618-a4ba-5420-bb9a-d7bb7128b190','f0391518-8c38-53be-b733-e66976ca299d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('4d5b0f52-c931-5ba9-931a-5d5c6327c4cb','a7176070-db0e-5e61-a082-30b87853b23c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('5bcba403-5156-5491-9f89-5d23f94db5cd','1dfbf5fa-798d-5fcb-87b4-f1773f2cdc0f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('b63c1788-419a-5a1a-86d2-656860478552','1552f6a7-b056-573a-b643-bb61ac6ded75','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('56f1ea0a-2391-52ac-80f9-50d537aa3ba4','bd505b78-aaae-5d25-af28-67d2e104c612','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('c991528a-4574-56fa-967c-946b8822dbaf','15470f95-f016-5e66-a22a-d246111fe82c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('3b7faf1a-891d-52b6-866c-aaf6a9cf0fd4','d80542d8-0e4e-553f-979c-18274dc911a1','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('0c348fc7-7ec5-5681-a6df-73a725041a47','482d85c7-90a3-534e-b87d-d13dd51e2975','1948d0dd-cc43-5c6b-bff1-4883dd942d44','cadastrado',250,5,'2026-06-16',null),
('3b76ead1-a1d7-5add-acbf-a7d54516cb00','666c3895-8729-5e57-a1b0-d4262db27783','c52640de-ec41-5c26-97de-4fc81d8f6c1e','cadastrado',250,5,'2026-06-16',null),
('e9214600-442b-5050-878e-708184c54508','44e92ff2-6e23-5e5a-9001-82765835ba96','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('8e94ec1d-180e-5353-bac1-4625a5a93ca8','689951ab-673b-581d-9f86-6183b83e3590','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('5d79ad6b-168a-5781-af91-9cc5d2c59969','0063e2d2-221c-543b-b821-56782438ee4f','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','cadastrado',250,5,'2026-06-16',null),
('1583d63f-6559-595d-8986-5cd6ed206a2c','c3fef054-f198-5495-a6f3-0f0e5b1cc3a4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('5fbff5c5-5c39-5a42-b855-e0e3b0e50bda','fbe8bc06-855a-5d35-b57f-d8a77ff436ea','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('b916a76c-da62-548e-886b-7dec4e1408d8','538e943c-540f-538b-841c-76212f909eeb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('badd610b-0e3a-5ef3-a964-8106e72cf91c','d98e9161-1d8a-564e-b07b-400688bec30b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('2ad4d621-a861-526e-ba26-2a868f4a9bf2','93c016ec-5f43-5e53-84ae-4fd40a1fee98','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('c3fe990f-034b-59cb-adf1-32f3551748f0','7b787dc0-9f11-5e95-9161-b1410bcb7eb4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('62d90d20-0d94-54fa-a334-3e7973275c6a','66d8f4ec-2dcd-523b-baa0-d39c55e79073','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('b7676798-17ea-5834-be7d-07270f0e278c','514e1948-c6bb-5521-be59-a3b24cad4231','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('fc51bc44-d769-5171-a048-81e7e626c2c1','e1c3b1bb-8c9e-5ef5-abdf-a959912bc456','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('608b3330-0b32-5a46-9ff6-a9000a94dc96','8f0b72d3-56e5-5684-aa99-e7ca81427d6d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('c83381d7-ae02-509b-9d22-a95c3b1984a3','a95305cd-865c-522a-96b2-3d49856f497c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('562b6627-6b7f-5a1d-8dff-eba33f629ce4','8af58282-e873-51bd-a6b0-711e8842ae26','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','contatado',250,10,'2026-06-12','Nathalia'),
('08d9c96f-a543-5ecc-8013-5076348b4a46','8b76a551-ebba-5418-af4d-71bd92fb6c0d','1948d0dd-cc43-5c6b-bff1-4883dd942d44','contatado',250,10,'2026-06-12','Nathalia'),
('46831c5b-e884-5d18-9cdd-441b44d40850','2c518a57-8af6-5e6b-9a7d-021c76d9f260','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('cdc58cbd-9bdd-5e5a-8019-e243af20fb58','01b9b07c-748f-51b1-a5fd-2b042f03bac2','ef3be889-0994-57f5-9665-c3e04d1fc4ce','contatado',250,10,'2026-06-12','Nathalia'),
('8a3d951a-421f-5cd3-9ba6-d8566b0473fd','fc9fd0e7-9152-5df1-ba33-6d505946b831','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('1a99e99c-84a8-53db-97c0-612b0e68ca1f','2715bc5e-0fe6-5c82-b182-bdf0b4fb68ee','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('bb4786d0-4f08-5334-9a6d-9a636cebac2e','1fe883bb-61e6-5bfc-925c-122eab1c4c42','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('d5587eb4-9613-5493-a38a-b5c1d08776bf','83858b6b-9edd-5224-8241-bfefcd28e22f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('01d975b9-503b-5afd-a945-1a09b86aa114','b9438376-b918-5ad1-a463-0f1d951fa73d','c52640de-ec41-5c26-97de-4fc81d8f6c1e','contatado',250,10,'2026-06-12','Nathalia'),
('49a56de0-b621-58c1-98b1-b60fb304f01b','2eed7f95-97f3-57d8-8547-b15e3b0b3f90','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('d4e1faa4-8a54-5392-9197-de78c5889dec','31317135-205a-5606-a556-1da6b88f5a31','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('cfed1ec9-dd70-5434-acd4-94a21faff787','6ed67a11-70e8-5ad9-af8e-8ceb5093e972','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('bf8b1da0-e493-5b3a-b53e-d9b8f5563dff','61fe87a9-f25a-57c8-b4c0-e47bc28d44d6','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','cadastrado',250,5,'2026-06-16',null),
('01df0708-ad3c-57e8-9cdc-5677d2bcb529','c93718d0-baed-5047-b541-c5c2307a070b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('8200c550-7cc2-5bf4-8f01-ebec2a535906','e22251b6-e6a5-5515-82b6-2239320daa5b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-12','Nathalia'),
('f6e7122d-2447-57b2-b090-05c916cf697b','98fccdc9-7b8c-5115-a34e-cf8a98c2f544','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('d3419c0b-611d-5f83-9833-ad324b886088','05f5ec40-c423-5bbe-81ba-4670b2ad95e5','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('63d58abb-a4cd-54e3-9a93-4d3499ff8654','0312d467-eade-5eee-a49e-d1b90fbe0bf1','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('44a9f3dc-fd06-5e17-a760-4897677cf37b','7c315fd4-8b4a-5a14-bb45-29bfa21231c7','1948d0dd-cc43-5c6b-bff1-4883dd942d44','cadastrado',250,5,'2026-06-16',null),
('19bc0939-de19-5454-a8e9-41d4300a9feb','0d64248a-146b-587c-a3c4-43e681acce61','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('6c39b400-39d0-56ae-9c51-2c15c48c1f96','69850b7f-979f-5f35-9416-03ccdc991acd','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('c0437141-cc72-5bf5-9270-1a4653100905','3ece21ef-8f48-5177-a310-5c2cbac3eedd','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('e479794b-c430-5583-b8e5-acb0b0102312','e54a0d55-389c-5e20-b945-941db632beeb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('c15d17d7-1c76-525d-a57c-af141fac6dcd','1dd36d59-a6c4-570b-9100-1b0dad51b7b1','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('93d456a1-4417-5410-a9a4-6f240c810203','1e6edc98-6a02-5663-9056-9b420bb95b19','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','cadastrado',250,5,'2026-06-16',null),
('90e38ca0-b09f-5ef8-b2d8-401d339bad29','073bda3f-79ca-5d59-bdd2-2defda8b8d82','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('652107a7-7055-589b-b892-77f70d78b57e','0420244a-a48b-524e-9d0f-f3c64904c09c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('6ac97e9c-8604-5ac0-a89b-013da6fd1a7f','1225ca48-6e30-574b-a582-5b4a78d2daff','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('c7336bdd-6835-557f-b563-5f09e0ec3f03','b7588a53-bb87-5e37-8ec3-3a47b08522bb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('512fcc71-4f70-586b-8c3a-85347ca77ce4','cbd921ba-bc57-5e9d-90cd-c8252394af2c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('dcb7d75f-879e-5c56-a833-b8c67d633fdf','9c742a3c-e371-5950-9e85-ac870f0b013d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('bf448d58-1ee2-5120-ae70-8be0306b4d24','b18d47df-b669-59f0-a51d-f6de1e1620c8','c52640de-ec41-5c26-97de-4fc81d8f6c1e','cadastrado',250,5,'2026-06-16',null),
('21907a86-286b-5d6e-99f7-32a996544055','393cf3c9-f32e-5299-ae54-7b527a9191cc','ef3be889-0994-57f5-9665-c3e04d1fc4ce','cadastrado',250,5,'2026-06-16',null),
('2beca79e-1629-5b86-b27a-d8cc2615c15a','93737bb3-2407-574b-affd-2b81ff42b671','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('dc72c706-e821-593e-92b1-0796e04293a7','e4d302bc-6c77-5199-b570-a2eb6f70de51','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('ca305d62-cad7-52d0-929a-cb07fd58715b','2a2cc9ca-900c-56bd-8b59-0a44c60e6fe6','1948d0dd-cc43-5c6b-bff1-4883dd942d44','cadastrado',250,5,'2026-06-16',null),
('5f92e4a6-ee05-565a-b9f4-e17028242880','ff594959-8e09-5609-bfc6-3541840468a4','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','cadastrado',250,5,'2026-06-16',null),
('20e2273d-c4bc-5538-8b85-bc66125b1a37','e6d88bae-7139-5a6c-99fb-6414d20555aa','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('386920ee-9471-5821-9cf1-9d09b08fc8db','cbb4ce42-4690-5003-b51a-29d7b17c760f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('bc407008-2e9a-5864-aed7-fcf3acf55d41','fb4c371a-0728-50ed-9141-7c0c975ebf99','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('3fbff747-874f-5007-9cc6-611d098afa37','d8bd1fb6-16cf-536e-9dac-84573376fa0d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('641af860-5ec7-5fbf-bffe-a7acfaa1827f','938e10f3-7fcb-5ceb-9839-7af36fc9af43','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('48bd7dda-b04b-5be3-be6c-b51ab76d00ab','c212e76e-9d09-52b2-8ad6-ecfd1060a25a','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('ec5735ac-2de8-5c18-b68e-4e7a702badff','03529169-9024-53e0-98de-62ec45ad2ed6','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','cadastrado',250,5,'2026-06-16',null),
('e8610980-ed87-5146-9593-e2afdf576a41','98460a0c-eb07-54f6-95b9-bfbfa054bd8b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-16',null),
('da98dce8-8193-5a44-a123-a356186daf08','cc77af72-8539-56c2-8619-31e8771ec4b4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-16',null),
('48697642-8199-59cb-b5fa-afac39c2ad4f','53d0c091-1f95-5b5d-ae7b-52396868fd0f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-16',null),
('1c0091f2-22cd-5a2f-999f-8f64ed19f190','e92787e4-a10a-52e3-a54e-6696932bfea4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-16',null),
('36ea4494-fa7e-537a-81d2-83b0278334dd','001cace6-f0ae-5608-be9c-7677285cc30e','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','qualificado',250,25,'2026-06-13',null),
('7b52455f-b7f5-5490-a819-e7410cdacd03','e01d5706-c209-53e6-9155-cca991c17ade','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-16',null),
('c9118f26-8918-5f20-b1f6-1dfa9a57668f','192c49dd-d372-5fa8-ae8b-2453f042c16b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-16',null),
('62a411fd-4bc7-5d73-9429-f35dc1755a41','7b800e9b-db6e-58a8-b9be-c23d9ef5ac40','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','contatado',250,10,'2026-06-16',null),
('a6817bde-9d9f-54b0-a849-df746fa6cdb8','24de39de-71e2-5581-b791-2ea0816dc6be','1948d0dd-cc43-5c6b-bff1-4883dd942d44','contatado',250,10,'2026-06-16',null);

-- ---------- Contatos (decisor/gatekeeper quando há) ----------
insert into contatos (conta_id,nome,papel) values
('2a8fa5d4-ac7e-574a-8175-1fd604d6bd51','Maurício','decisor'),
('ffacae68-0de8-5ef7-87af-777bd7869abe','Marcos','decisor'),
('8af7216b-c715-52a6-8367-a04434178113','Marina Salum','decisor'),
('13a403df-0e1c-5aef-a06c-a15c69f1ebf7','Carla, Pedro Paulo','decisor'),
('13a403df-0e1c-5aef-a06c-a15c69f1ebf7','Carol','gatekeeper'),
('bd505b78-aaae-5d25-af28-67d2e104c612','Marcelo','decisor'),
('bd505b78-aaae-5d25-af28-67d2e104c612','Silmara','gatekeeper'),
('001cace6-f0ae-5608-be9c-7677285cc30e','Victória','decisor'),
('001cace6-f0ae-5608-be9c-7677285cc30e','Victória','gatekeeper');

-- ---------- Interações (primeiro contato WhatsApp / visita) ----------
insert into interacoes (conta_id,canal_id,tipo,data,resumo,autor) values
('ea0fe8e3-d9ac-5541-928f-c4b02645070d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('d674f51a-2373-533b-848b-fc28b22f76c0','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('2a8fa5d4-ac7e-574a-8175-1fd604d6bd51','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-15','Primeiro contato via WhatsApp','Nathalia'),
('b7089f60-bb9a-59ef-b554-a323b25ab4f0','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('e90e5acc-d2be-54aa-9ce2-c1e94610432c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('7306ad24-847a-507f-9f29-5d61a5ab01ce','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('ffacae68-0de8-5ef7-87af-777bd7869abe','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-15','Primeiro contato via WhatsApp','Nathalia'),
('f9b0121b-5a62-542f-bcc4-65633bcaae97','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('491184af-8ec5-545b-97c5-a02fe6813911','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('ba7d3f12-d125-5669-a3e9-e0c286f55fe3','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('c00cc529-1363-5b7a-8084-8ba7705e154d','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('293c3b6e-1dca-57ef-aabb-c8a04dd1f465','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('07d04c12-f427-5d37-94c0-1e279e92fdee','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('9e630d4b-a23b-524d-9ebf-0cf8123a2b2a','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('b3f9df8a-1eef-5d4f-b6f4-f3a1a12cbdf9','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('bed5708b-d594-521e-93ef-e46264d74d18','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('50ed735a-9ba6-5128-a0a3-c1ac4f665512','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('86e5a892-fe8f-5b92-97f4-3e4524d45af8','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('e9be071e-3756-5ba3-a5fc-a1ccc5c34546','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('fa74914c-dc1e-5a9f-acb5-ea193fa450cb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('8af7216b-c715-52a6-8367-a04434178113','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-15','Primeiro contato via WhatsApp','Nathalia'),
('e8313437-3a9f-50ec-8147-5095669062e2','c52640de-ec41-5c26-97de-4fc81d8f6c1e','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('7d2f2122-2689-52b9-af99-0da96e865c5e','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('9894980a-2dba-5f64-8f25-c0786a4e5c7f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('8f06633b-05f0-53d5-80ec-c037360cc3eb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('13a403df-0e1c-5aef-a06c-a15c69f1ebf7','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('362a0931-3779-5833-9877-4db230c44787','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('1dfbf5fa-798d-5fcb-87b4-f1773f2cdc0f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('bd505b78-aaae-5d25-af28-67d2e104c612','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('c3fef054-f198-5495-a6f3-0f0e5b1cc3a4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('fbe8bc06-855a-5d35-b57f-d8a77ff436ea','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('538e943c-540f-538b-841c-76212f909eeb','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('93c016ec-5f43-5e53-84ae-4fd40a1fee98','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('7b787dc0-9f11-5e95-9161-b1410bcb7eb4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('a95305cd-865c-522a-96b2-3d49856f497c','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('8af58282-e873-51bd-a6b0-711e8842ae26','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('8b76a551-ebba-5418-af4d-71bd92fb6c0d','1948d0dd-cc43-5c6b-bff1-4883dd942d44','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('01b9b07c-748f-51b1-a5fd-2b042f03bac2','ef3be889-0994-57f5-9665-c3e04d1fc4ce','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('1fe883bb-61e6-5bfc-925c-122eab1c4c42','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('83858b6b-9edd-5224-8241-bfefcd28e22f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('b9438376-b918-5ad1-a463-0f1d951fa73d','c52640de-ec41-5c26-97de-4fc81d8f6c1e','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('2eed7f95-97f3-57d8-8547-b15e3b0b3f90','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('31317135-205a-5606-a556-1da6b88f5a31','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('e22251b6-e6a5-5515-82b6-2239320daa5b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp','Nathalia'),
('98460a0c-eb07-54f6-95b9-bfbfa054bd8b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null),
('cc77af72-8539-56c2-8619-31e8771ec4b4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null),
('53d0c091-1f95-5b5d-ae7b-52396868fd0f','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null),
('e92787e4-a10a-52e3-a54e-6696932bfea4','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null),
('001cace6-f0ae-5608-be9c-7677285cc30e','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','whatsapp','2026-06-13','Primeiro contato via WhatsApp',null),
('e01d5706-c209-53e6-9155-cca991c17ade','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null),
('192c49dd-d372-5fa8-ae8b-2453f042c16b','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null),
('7b800e9b-db6e-58a8-b9be-c23d9ef5ac40','84043611-274c-5fbc-9c5f-cf8bf7fd12a6','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null),
('24de39de-71e2-5581-b791-2ea0816dc6be','1948d0dd-cc43-5c6b-bff1-4883dd942d44','whatsapp','2026-06-12','Primeiro contato via WhatsApp',null);

-- ============================================================================
-- BLOCO DE DEMONSTRAÇÃO  (dados ilustrativos p/ ver o app vivo — NÃO é base fria)
-- Empurra 3 canais para 'Gerando dados' e desbloqueia tarefas, p/ exibir todos
-- os estados de canal, KPIs, funil e Voz do Cliente. Reais: Breadbox (case) e
-- Rede Café X (pipeline). Remova este bloco para ficar só com a base crua.
-- ============================================================================

-- Conta real virada cliente (case Breadbox) + Voz do Cliente fixada como prova
insert into contas (id,nome,endereco,bairro,telefone,canal_origem_id,temperatura,responsavel,visitada,ref_externa) values
('f1860347-a718-5d89-bd70-f1cf7cee95f1','Breadbox Florianópolis','R. Bocaiúva, 2468 - Centro','Centro','(48) 99999-0001','c52640de-ec41-5c26-97de-4fc81d8f6c1e','quente','Natalia',true,'DEMO-1');
insert into oportunidades (id,conta_id,canal_id,estagio,valor_mrr,probabilidade,data_entrada_estagio,previsao_fechamento,responsavel) values
('cac0201c-089c-560c-908f-1ee68427bc28','f1860347-a718-5d89-bd70-f1cf7cee95f1','c52640de-ec41-5c26-97de-4fc81d8f6c1e','fechado_ganho',850,100,'2026-06-06','2026-06-06','Natalia');
insert into interacoes (conta_id,canal_id,tipo,data,resumo,autor) values
('f1860347-a718-5d89-bd70-f1cf7cee95f1','c52640de-ec41-5c26-97de-4fc81d8f6c1e','reuniao','2026-06-06','Fechamento — call mensal','Natalia');
insert into voz_do_cliente (conta_id,tipo,titulo,conteudo,autor_cliente,resultado_mensuravel,autorizado,fixado_como_prova,tags) values
('f1860347-a718-5d89-bd70-f1cf7cee95f1','depoimento','Breadbox recuperou 20h/semana','Antes eu era contador da minha cafeteria. Agora sou empreendedor de verdade.','Alisson — Breadbox','20h/sem economizadas · R$16k recuperado em disputas',true,true,array['pitch','linkedin','site']);

-- Deal enterprise em negociação (pipeline real)
insert into contas (id,nome,endereco,bairro,canal_origem_id,temperatura,responsavel,ref_externa) values
('5a35f466-e9b4-5003-95c8-dc1a166ab645','Rede Café X (12 unidades)','Multi-unidade - Grande Floripa','Grande Floripa','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','quente','Natalia','DEMO-2');
insert into oportunidades (id,conta_id,canal_id,estagio,valor_mrr,probabilidade,data_entrada_estagio,previsao_fechamento,responsavel) values
('2e886ed4-6205-51e1-ae89-9491fcd1bbed','5a35f466-e9b4-5003-95c8-dc1a166ab645','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','negociacao',10200,70,'2026-06-10','2026-06-30','Natalia');
insert into interacoes (conta_id,canal_id,tipo,data,resumo,autor) values
('5a35f466-e9b4-5003-95c8-dc1a166ab645','ee59e5dc-f871-5187-9cb6-f769b03dd9f6','reuniao','2026-06-12','Demo agendada com o COO','Natalia');

-- Base Yungas: avançar 1 conta-piloto para 'reuniao' (gera dado real no canal)
update oportunidades set estagio='reuniao', probabilidade=40, data_entrada_estagio='2026-06-13'
  where id='b4d7b4dd-a9d6-5b94-9537-b018815b55ef';
update contas set temperatura='morno' where id='7380714d-6d24-5a14-a4c9-1357d13a0eb7';

-- Marcar tarefas concluídas (execução > 0 e desbloqueio de dependências)
update tarefas set status='feito' where codigo='S1';
update tarefas set status='feito' where codigo='S2';
update tarefas set status='feito' where codigo='S3';
update tarefas set status='feito' where codigo='S4';
update tarefas set status='feito' where codigo='S5';
update tarefas set status='feito' where codigo='Y1';
update tarefas set status='feito' where codigo='Y2';
update tarefas set status='feito' where codigo='I1';
update tarefas set status='feito' where codigo='O1';
update tarefas set status='feito' where codigo='O2';

-- Log manual de mensagem (sem envio real de WhatsApp)
insert into mensagens_log (conta_id,canal_id,variante,status_manual,enviado_em,autor,observacao)
select id,'ee59e5dc-f871-5187-9cb6-f769b03dd9f6','A','respondido','2026-06-12'::timestamptz,'Natalia','Respondeu pedindo proposta'
  from contas where ref_externa='DEMO-2';

commit;

-- Verificação rápida (rode no SQL editor):
-- select 'canais',count(*) from canais union all select 'contas',count(*) from contas
--   union all select 'oportunidades',count(*) from oportunidades
--   union all select 'tarefas',count(*) from tarefas union all select 'gates',count(*) from gates;
