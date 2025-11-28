-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para gerenciamento_1
CREATE DATABASE IF NOT EXISTS `gerenciamento_1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `gerenciamento_1`;

-- Copiando estrutura para função gerenciamento_1.calcular_pascoa
DELIMITER //
CREATE FUNCTION `calcular_pascoa`(ano INT) RETURNS date
BEGIN
    DECLARE a INT;
    DECLARE b INT;
    DECLARE c INT;
    DECLARE d INT;
    DECLARE e INT;
    DECLARE dia INT;
    DECLARE mes INT;

    SET a = ano % 19;
    SET b = FLOOR(ano / 100);
    SET c = ano % 100;
    SET d = FLOOR(b / 4);
    SET e = b % 4;

    SET d = (19 * a + b - d - ((b - e + 8) / 25) + 15) % 30;
    SET e = (32 + 2 * (b % 4) + 2 * FLOOR(c / 4) - d - (c % 4)) % 7;
    SET mes = FLOOR((d + e - 7 * ((a + 11 * d + 22 * e) / 451) + 114) / 31);
    SET dia = ((d + e - 7 * ((a + 11 * d + 22 * e) / 451) + 114) % 31) + 1;

    RETURN DATE(CONCAT(ano, '-', mes, '-', dia));
END//
DELIMITER ;

-- Copiando estrutura para procedure gerenciamento_1.calcular_termino_turma
DELIMITER //
CREATE PROCEDURE `calcular_termino_turma`(IN p_id_turma INT)
BEGIN
    DECLARE v_data_inicio DATE;
    DECLARE v_horas_totais DECIMAL(10,2);
    DECLARE v_horas_acumuladas_min INT DEFAULT 0;
    DECLARE v_dia_semana_nome VARCHAR(20);
    DECLARE v_horario_inicio TIME;
    DECLARE v_horario_fim TIME;
    DECLARE v_duracao_aula_min INT;
    DECLARE done INT DEFAULT 0;
    DECLARE v_data_termino DATETIME;
    DECLARE v_horas_totais_min INT;

    DECLARE cur_aula CURSOR FOR
        SELECT horario_inicio, horario_fim,
               TIMESTAMPDIFF(MINUTE, horario_inicio, horario_fim) AS duracao_aula_min
        FROM turmas_horarios
        WHERE id_turma = p_id_turma AND LOWER(dia_semana) COLLATE utf8mb4_general_ci = LOWER(v_dia_semana_nome) COLLATE utf8mb4_general_ci
        ORDER BY horario_inicio;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SELECT inicio, carga_horaria
    INTO v_data_inicio, v_horas_totais
    FROM turmas
    WHERE id_turma = p_id_turma;

    SET v_horas_totais_min = v_horas_totais * 60;
    SET @data_atual = v_data_inicio;

    ajustar_inicio: LOOP
        BEGIN
            SET v_dia_semana_nome = CASE DAYOFWEEK(@data_atual)
                                        WHEN 1 THEN 'Domingo'
                                        WHEN 2 THEN 'Segunda'
                                        WHEN 3 THEN 'Terça'
                                        WHEN 4 THEN 'Quarta'
                                        WHEN 5 THEN 'Quinta'
                                        WHEN 6 THEN 'Sexta'
                                        WHEN 7 THEN 'Sábado'
                                    END;

            IF EXISTS (
                SELECT 1
                FROM turmas_horarios
                WHERE id_turma = p_id_turma
                  AND LOWER(dia_semana) COLLATE utf8mb4_general_ci = LOWER(v_dia_semana_nome) COLLATE utf8mb4_general_ci
            ) THEN
                SET v_data_inicio = @data_atual;
                LEAVE ajustar_inicio;
            END IF;

            SET @data_atual = DATE_ADD(@data_atual, INTERVAL 1 DAY);
        END;
    END LOOP ajustar_inicio;

    UPDATE turmas SET inicio = v_data_inicio WHERE id_turma = p_id_turma;

    WHILE v_horas_acumuladas_min < v_horas_totais_min DO
        SET v_dia_semana_nome = CASE DAYOFWEEK(@data_atual)
                                    WHEN 1 THEN 'Domingo'
                                    WHEN 2 THEN 'Segunda'
                                    WHEN 3 THEN 'Terça'
                                    WHEN 4 THEN 'Quarta'
                                    WHEN 5 THEN 'Quinta'
                                    WHEN 6 THEN 'Sexta'
                                    WHEN 7 THEN 'Sábado'
                                END;

        OPEN cur_aula;

        read_loop: LOOP
            FETCH cur_aula INTO v_horario_inicio, v_horario_fim, v_duracao_aula_min;
            IF done = 1 THEN
                LEAVE read_loop;
            END IF;

            IF v_horas_acumuladas_min + v_duracao_aula_min >= v_horas_totais_min THEN
                SET v_duracao_aula_min = v_horas_totais_min - v_horas_acumuladas_min;
                SET v_horas_acumuladas_min = v_horas_totais_min;
                SET v_data_termino = TIMESTAMPADD(MINUTE, v_duracao_aula_min, TIMESTAMP(@data_atual, v_horario_inicio));
                LEAVE read_loop;
            ELSE
                SET v_horas_acumuladas_min = v_horas_acumuladas_min + v_duracao_aula_min;
            END IF;
        END LOOP read_loop;

        CLOSE cur_aula;
        SET done = 0;
        SET @data_atual = DATE_ADD(@data_atual, INTERVAL 1 DAY);
    END WHILE;

    UPDATE turmas SET termino = v_data_termino WHERE id_turma = p_id_turma;

END//
DELIMITER ;

-- Copiando estrutura para tabela gerenciamento_1.cursos
CREATE TABLE IF NOT EXISTS `cursos` (
  `id_curso` int(11) NOT NULL AUTO_INCREMENT,
  `nivel` enum('iniciacao','qualificacao','especializacao','aperfeicoamento') NOT NULL,
  `preco` decimal(10,2) DEFAULT 0.00,
  `parcelas_max` int(11) DEFAULT 1,
  PRIMARY KEY (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.cursos: ~3 rows (aproximadamente)
INSERT INTO `cursos` (`id_curso`, `nivel`, `preco`, `parcelas_max`) VALUES
	(101, 'iniciacao', 12000.00, 3);

-- Copiando estrutura para tabela gerenciamento_1.curso_nome
CREATE TABLE IF NOT EXISTS `curso_nome` (
  `id_curso` int(11) NOT NULL,
  `id_nome_curso` int(11) NOT NULL,
  PRIMARY KEY (`id_curso`,`id_nome_curso`),
  KEY `id_nome_curso` (`id_nome_curso`),
  CONSTRAINT `curso_nome_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `curso_nome_ibfk_2` FOREIGN KEY (`id_nome_curso`) REFERENCES `nome_cursos` (`id_nome_curso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.curso_nome: ~3 rows (aproximadamente)
INSERT INTO `curso_nome` (`id_curso`, `id_nome_curso`) VALUES
	(101, 8);

-- Copiando estrutura para função gerenciamento_1.dias_ordenados
DELIMITER //
CREATE FUNCTION `dias_ordenados`(data_inicio DATE, dias_lista VARCHAR(255)) RETURNS text CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
    DECLARE resultado TEXT DEFAULT '';
    DECLARE i INT DEFAULT 1;
    DECLARE dia_nome VARCHAR(10);
    DECLARE dia_num INT;
    DECLARE dias_count INT;
    DECLARE temp TEXT DEFAULT '';

    -- conta quantos dias na lista
    SET dias_count = LENGTH(dias_lista) - LENGTH(REPLACE(dias_lista, ',', '')) + 1;

    -- percorre a lista e calcula dias até ocorrer
    WHILE i <= dias_count DO
        SET dia_nome = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(dias_lista, ',', i), ',', -1));

        SET dia_num = CASE dia_nome
            WHEN 'Domingo' THEN 1
            WHEN 'Segunda' THEN 2
            WHEN 'Terça' THEN 3
            WHEN 'Quarta' THEN 4
            WHEN 'Quinta' THEN 5
            WHEN 'Sexta' THEN 6
            WHEN 'Sábado' THEN 7
            ELSE NULL
        END;

        -- concatena prefixando o número de dias até ocorrer
        SET temp = CONCAT(temp, LPAD((7 + dia_num - DAYOFWEEK(data_inicio)) % 7, 2, '0'), '|', dia_nome, ',');
        SET i = i + 1;
    END WHILE;

    -- ordena os valores pelo número de dias
    -- aqui precisamos de um truque: convertendo a string em conjunto para ordenar
    SET resultado = TRIM(BOTH ',' FROM (
        SELECT GROUP_CONCAT(SUBSTRING_INDEX(t.val, '|', -1) ORDER BY CAST(SUBSTRING_INDEX(t.val, '|', 1) AS UNSIGNED) ASC SEPARATOR ',')
        FROM (SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(temp, ',', n.n), ',', -1)) AS val
              FROM (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
                    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7) n
              WHERE n.n <= dias_count
             ) t
    ));

    RETURN resultado;
END//
DELIMITER ;

-- Copiando estrutura para tabela gerenciamento_1.docente
CREATE TABLE IF NOT EXISTS `docente` (
  `id_docente` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `nif` varchar(10) DEFAULT NULL,
  `status` enum('ativo','inativo','ferias','licenca') NOT NULL DEFAULT 'ativo',
  PRIMARY KEY (`id_docente`),
  UNIQUE KEY `nif` (`nif`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.docente: ~3 rows (aproximadamente)
INSERT INTO `docente` (`id_docente`, `nome`, `nif`, `status`) VALUES
	(35, 'exemplo 1', '7654321', 'ativo');

-- Copiando estrutura para tabela gerenciamento_1.docentes_turmas
CREATE TABLE IF NOT EXISTS `docentes_turmas` (
  `id_docente` int(11) NOT NULL,
  `id_turma` int(11) NOT NULL,
  PRIMARY KEY (`id_docente`,`id_turma`),
  KEY `fk_docentes_turmas_turmas_idx` (`id_turma`),
  CONSTRAINT `fk_docentes_turmas_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_docentes_turmas_turmas` FOREIGN KEY (`id_turma`) REFERENCES `turmas` (`id_turma`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.docentes_turmas: ~3 rows (aproximadamente)
INSERT INTO `docentes_turmas` (`id_docente`, `id_turma`) VALUES
	(35, 76);

-- Copiando estrutura para tabela gerenciamento_1.feriados
CREATE TABLE IF NOT EXISTS `feriados` (
  `id_feriado` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `data_feriado` date NOT NULL,
  `tipo` enum('nacional','estadual','municipal','facultativo') NOT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `recorrente` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_feriado`),
  UNIQUE KEY `data_feriado_nome` (`data_feriado`,`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.feriados: ~99 rows (aproximadamente)
INSERT INTO `feriados` (`id_feriado`, `nome`, `data_feriado`, `tipo`, `observacao`, `recorrente`) VALUES
	(1, 'Confraternização Universal', '2025-01-01', 'nacional', 'Ano Novo', 1),
	(2, 'Tiradentes', '2025-04-21', 'nacional', 'Homenagem a Joaquim José da Silva Xavier', 1),
	(3, 'Dia do Trabalho', '2025-05-01', 'nacional', 'Homenagem aos trabalhadores', 1),
	(4, 'Independência do Brasil', '2025-09-07', 'nacional', 'Proclamação da independência em 1822', 1),
	(5, 'Nossa Senhora Aparecida', '2025-10-12', 'nacional', 'Padroeira do Brasil', 1),
	(6, 'Finados', '2025-11-02', 'nacional', 'Dia de homenagem aos mortos', 1),
	(7, 'Proclamação da República', '2025-11-15', 'nacional', 'Proclamação da República em 1889', 1),
	(8, 'Natal', '2025-12-25', 'nacional', 'Comemoração do nascimento de Jesus Cristo', 1),
	(9, 'Carnaval', '2025-03-03', 'facultativo', 'Segunda-feira de Carnaval', 1),
	(10, 'Carnaval', '2025-03-04', 'facultativo', 'Terça-feira de Carnaval', 1),
	(11, 'Paixão de Cristo', '2025-04-18', 'nacional', 'Sexta-feira Santa', 1),
	(12, 'Corpus Christi', '2025-06-19', 'facultativo', 'Feriado religioso de Corpus Christi', 1),
	(13, 'Revolução Constitucionalista', '2025-07-09', 'estadual', 'Feriado estadual em São Paulo', 1),
	(14, 'Dia da Consciência Negra', '2025-11-20', 'estadual', 'Comemoração de Zumbi dos Palmares e luta contra o racismo', 1),
	(15, 'Confraternização Universal', '2026-01-01', 'nacional', 'Ano Novo', 1),
	(16, 'Tiradentes', '2026-04-21', 'nacional', 'Homenagem a Joaquim José da Silva Xavier', 1),
	(17, 'Dia do Trabalho', '2026-05-01', 'nacional', 'Homenagem aos trabalhadores', 1),
	(18, 'Independência do Brasil', '2026-09-07', 'nacional', 'Proclamação da independência em 1822', 1),
	(19, 'Nossa Senhora Aparecida', '2026-10-12', 'nacional', 'Padroeira do Brasil', 1),
	(20, 'Finados', '2026-11-02', 'nacional', 'Dia de homenagem aos mortos', 1),
	(21, 'Proclamação da República', '2026-11-15', 'nacional', 'Proclamação da República em 1889', 1),
	(22, 'Natal', '2026-12-25', 'nacional', 'Comemoração do nascimento de Jesus Cristo', 1),
	(23, 'Carnaval', '2026-03-03', 'facultativo', 'Segunda-feira de Carnaval', 1),
	(24, 'Carnaval', '2026-03-04', 'facultativo', 'Terça-feira de Carnaval', 1),
	(25, 'Paixão de Cristo', '2026-04-18', 'nacional', 'Sexta-feira Santa', 1),
	(26, 'Corpus Christi', '2026-06-19', 'facultativo', 'Feriado religioso de Corpus Christi', 1),
	(27, 'Revolução Constitucionalista', '2026-07-09', 'estadual', 'Feriado estadual em São Paulo', 1),
	(28, 'Dia da Consciência Negra', '2026-11-20', 'estadual', 'Comemoração de Zumbi dos Palmares e luta contra o racismo', 1),
	(30, 'Carnaval (Segunda-feira)', '2026-02-19', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(31, 'Carnaval (Terça-feira)', '2026-02-20', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(32, 'Paixão de Cristo', '2026-04-06', 'nacional', 'Sexta-feira Santa', 0),
	(33, 'Páscoa', '2026-04-08', 'facultativo', 'Domingo de Páscoa', 0),
	(34, 'Corpus Christi', '2026-06-07', 'facultativo', 'Feriado religioso', 0),
	(35, 'Confraternização Universal', '2027-01-01', 'nacional', 'Ano Novo', 1),
	(36, 'Tiradentes', '2027-04-21', 'nacional', 'Homenagem a Joaquim José da Silva Xavier', 1),
	(37, 'Dia do Trabalho', '2027-05-01', 'nacional', 'Homenagem aos trabalhadores', 1),
	(38, 'Independência do Brasil', '2027-09-07', 'nacional', 'Proclamação da independência em 1822', 1),
	(39, 'Nossa Senhora Aparecida', '2027-10-12', 'nacional', 'Padroeira do Brasil', 1),
	(40, 'Finados', '2027-11-02', 'nacional', 'Dia de homenagem aos mortos', 1),
	(41, 'Proclamação da República', '2027-11-15', 'nacional', 'Proclamação da República em 1889', 1),
	(42, 'Natal', '2027-12-25', 'nacional', 'Comemoração do nascimento de Jesus Cristo', 1),
	(43, 'Carnaval', '2027-03-03', 'facultativo', 'Segunda-feira de Carnaval', 1),
	(44, 'Carnaval', '2027-03-04', 'facultativo', 'Terça-feira de Carnaval', 1),
	(45, 'Paixão de Cristo', '2027-04-18', 'nacional', 'Sexta-feira Santa', 1),
	(46, 'Corpus Christi', '2027-06-19', 'facultativo', 'Feriado religioso de Corpus Christi', 1),
	(47, 'Revolução Constitucionalista', '2027-07-09', 'estadual', 'Feriado estadual em São Paulo', 1),
	(48, 'Dia da Consciência Negra', '2027-11-20', 'estadual', 'Comemoração de Zumbi dos Palmares e luta contra o racismo', 1),
	(50, 'Carnaval (Segunda-feira)', '2027-02-07', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(51, 'Carnaval (Terça-feira)', '2027-02-08', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(52, 'Paixão de Cristo', '2027-03-25', 'nacional', 'Sexta-feira Santa', 0),
	(53, 'Páscoa', '2027-03-27', 'facultativo', 'Domingo de Páscoa', 0),
	(54, 'Corpus Christi', '2027-05-26', 'facultativo', 'Feriado religioso', 0),
	(55, 'Confraternização Universal', '2028-01-01', 'nacional', 'Ano Novo', 1),
	(56, 'Tiradentes', '2028-04-21', 'nacional', 'Homenagem a Joaquim José da Silva Xavier', 1),
	(57, 'Dia do Trabalho', '2028-05-01', 'nacional', 'Homenagem aos trabalhadores', 1),
	(58, 'Independência do Brasil', '2028-09-07', 'nacional', 'Proclamação da independência em 1822', 1),
	(59, 'Nossa Senhora Aparecida', '2028-10-12', 'nacional', 'Padroeira do Brasil', 1),
	(60, 'Finados', '2028-11-02', 'nacional', 'Dia de homenagem aos mortos', 1),
	(61, 'Proclamação da República', '2028-11-15', 'nacional', 'Proclamação da República em 1889', 1),
	(62, 'Natal', '2028-12-25', 'nacional', 'Comemoração do nascimento de Jesus Cristo', 1),
	(63, 'Carnaval', '2028-03-03', 'facultativo', 'Segunda-feira de Carnaval', 1),
	(64, 'Carnaval', '2028-03-04', 'facultativo', 'Terça-feira de Carnaval', 1),
	(65, 'Paixão de Cristo', '2028-04-18', 'nacional', 'Sexta-feira Santa', 1),
	(66, 'Corpus Christi', '2028-06-19', 'facultativo', 'Feriado religioso de Corpus Christi', 1),
	(67, 'Revolução Constitucionalista', '2028-07-09', 'estadual', 'Feriado estadual em São Paulo', 1),
	(68, 'Dia da Consciência Negra', '2028-11-20', 'estadual', 'Comemoração de Zumbi dos Palmares e luta contra o racismo', 1),
	(70, 'Carnaval (Segunda-feira)', '2028-02-24', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(71, 'Carnaval (Terça-feira)', '2028-02-25', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(72, 'Paixão de Cristo', '2028-04-10', 'nacional', 'Sexta-feira Santa', 0),
	(73, 'Páscoa', '2028-04-12', 'facultativo', 'Domingo de Páscoa', 0),
	(74, 'Corpus Christi', '2028-06-11', 'facultativo', 'Feriado religioso', 0),
	(75, 'Confraternização Universal', '2029-01-01', 'nacional', 'Ano Novo', 1),
	(76, 'Tiradentes', '2029-04-21', 'nacional', 'Homenagem a Joaquim José da Silva Xavier', 1),
	(77, 'Dia do Trabalho', '2029-05-01', 'nacional', 'Homenagem aos trabalhadores', 1),
	(78, 'Independência do Brasil', '2029-09-07', 'nacional', 'Proclamação da independência em 1822', 1),
	(79, 'Nossa Senhora Aparecida', '2029-10-12', 'nacional', 'Padroeira do Brasil', 1),
	(80, 'Finados', '2029-11-02', 'nacional', 'Dia de homenagem aos mortos', 1),
	(81, 'Proclamação da República', '2029-11-15', 'nacional', 'Proclamação da República em 1889', 1),
	(82, 'Natal', '2029-12-25', 'nacional', 'Comemoração do nascimento de Jesus Cristo', 1),
	(83, 'Carnaval', '2029-03-03', 'facultativo', 'Segunda-feira de Carnaval', 1),
	(84, 'Carnaval', '2029-03-04', 'facultativo', 'Terça-feira de Carnaval', 1),
	(85, 'Paixão de Cristo', '2029-04-18', 'nacional', 'Sexta-feira Santa', 1),
	(86, 'Corpus Christi', '2029-06-19', 'facultativo', 'Feriado religioso de Corpus Christi', 1),
	(87, 'Revolução Constitucionalista', '2029-07-09', 'estadual', 'Feriado estadual em São Paulo', 1),
	(88, 'Dia da Consciência Negra', '2029-11-20', 'estadual', 'Comemoração de Zumbi dos Palmares e luta contra o racismo', 1),
	(90, 'Carnaval (Segunda-feira)', '2029-02-15', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(91, 'Carnaval (Terça-feira)', '2029-02-16', 'facultativo', 'Ponto facultativo de Carnaval', 0),
	(92, 'Paixão de Cristo', '2029-04-02', 'nacional', 'Sexta-feira Santa', 0),
	(93, 'Páscoa', '2029-04-04', 'facultativo', 'Domingo de Páscoa', 0),
	(94, 'Corpus Christi', '2029-06-03', 'facultativo', 'Feriado religioso', 0),
	(95, 'Dia do Santos', '2025-10-11', 'facultativo', '', 1),
	(99, 'hoje', '2025-11-26', 'estadual', '', 1),
	(100, 'amanhã', '2025-11-27', 'nacional', '', 1);

-- Copiando estrutura para procedure gerenciamento_1.gerar_feriados_ano
DELIMITER //
CREATE PROCEDURE `gerar_feriados_ano`(IN ano INT)
BEGIN
    DECLARE data_pascoa DATE;
    DECLARE carnaval_segunda DATE;
    DECLARE carnaval_terca DATE;
    DECLARE sexta_santa DATE;
    DECLARE corpus_christi DATE;

    -- Calcula a Páscoa e os feriados móveis
    SET data_pascoa = calcular_pascoa(ano);
    SET carnaval_segunda = DATE_SUB(data_pascoa, INTERVAL 48 DAY);
    SET carnaval_terca   = DATE_SUB(data_pascoa, INTERVAL 47 DAY);
    SET sexta_santa      = DATE_SUB(data_pascoa, INTERVAL 2 DAY);
    SET corpus_christi   = DATE_ADD(data_pascoa, INTERVAL 60 DAY);

    -- Insere feriados fixos (recorrentes)
    INSERT INTO feriados (nome, data_feriado, tipo, observacao, recorrente)
    SELECT 
        nome,
        DATE(CONCAT(ano, '-', DATE_FORMAT(data_feriado, '%m-%d'))),
        tipo,
        observacao,
        recorrente
    FROM feriados
    WHERE recorrente = 1
      AND YEAR(data_feriado) = (ano - 1);

    -- Insere feriados móveis calculados
    INSERT INTO feriados (nome, data_feriado, tipo, observacao, recorrente) VALUES
    ('Carnaval (Segunda-feira)', carnaval_segunda, 'facultativo', 'Ponto facultativo de Carnaval', 0),
    ('Carnaval (Terça-feira)', carnaval_terca, 'facultativo', 'Ponto facultativo de Carnaval', 0),
    ('Paixão de Cristo', sexta_santa, 'nacional', 'Sexta-feira Santa', 0),
    ('Páscoa', data_pascoa, 'facultativo', 'Domingo de Páscoa', 0),
    ('Corpus Christi', corpus_christi, 'facultativo', 'Feriado religioso', 0);
END//
DELIMITER ;

-- Copiando estrutura para tabela gerenciamento_1.nome_cursos
CREATE TABLE IF NOT EXISTS `nome_cursos` (
  `id_nome_curso` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `status` enum('ativo','inativo','suspenso','encerrado') DEFAULT 'ativo',
  PRIMARY KEY (`id_nome_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.nome_cursos: ~3 rows (aproximadamente)
INSERT INTO `nome_cursos` (`id_nome_curso`, `nome`, `status`) VALUES
	(7, 'Microsoft Planner', 'ativo'),
	(8, 'Microsoft Power BI', 'ativo'),
	(9, 'Python', 'ativo');

-- Copiando estrutura para tabela gerenciamento_1.parcelas
CREATE TABLE IF NOT EXISTS `parcelas` (
  `id_parcela` int(11) NOT NULL AUTO_INCREMENT,
  `id_curso` int(11) NOT NULL,
  `qtd_parcelas` int(11) NOT NULL,
  `valor_parcela` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_parcela`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `parcelas_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.parcelas: ~2 rows (aproximadamente)
INSERT INTO `parcelas` (`id_parcela`, `id_curso`, `qtd_parcelas`, `valor_parcela`) VALUES
	(31, 101, 3, 4000.00);

-- Copiando estrutura para tabela gerenciamento_1.permissoes
CREATE TABLE IF NOT EXISTS `permissoes` (
  `id_permissao` int(11) NOT NULL AUTO_INCREMENT,
  `nome_permissao` varchar(100) NOT NULL COMMENT 'Ex: EDITAR_TUDO, EDITAR_VAGAS',
  `descricao` varchar(255) DEFAULT NULL,
  `cargo` enum('gestao','asa') NOT NULL,
  PRIMARY KEY (`id_permissao`),
  UNIQUE KEY `nome_permissao_UNIQUE` (`nome_permissao`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.permissoes: ~3 rows (aproximadamente)
INSERT INTO `permissoes` (`id_permissao`, `nome_permissao`, `descricao`, `cargo`) VALUES
	(1, 'EDITAR_TUDO', 'Permite editar qualquer registro no sistema', 'gestao'),
	(2, 'EDITAR_VAGAS', 'Permite alterar o número de vagas de uma turma', 'gestao'),
	(3, 'GERENCIAR_USUARIOS', 'Permite criar, editar e remover usuários', 'gestao');

-- Copiando estrutura para tabela gerenciamento_1.turmas
CREATE TABLE IF NOT EXISTS `turmas` (
  `id_turma` int(11) NOT NULL AUTO_INCREMENT,
  `id_curso` int(11) NOT NULL,
  `nome_sgset` varchar(50) NOT NULL,
  `local` varchar(50) DEFAULT NULL,
  `turno` enum('M','T','N','I') NOT NULL COMMENT 'Manhã, Tarde, Noite, Integral',
  `inicio` date DEFAULT NULL,
  `termino` date DEFAULT NULL,
  `carga_horaria` int(11) DEFAULT NULL,
  `vagas` int(11) DEFAULT NULL,
  `matriculas` int(11) DEFAULT 0,
  `status` enum('prevista','aberta','em_andamento','concluida','cancelada','sem-cor','vermelho','cinza','verde','amarelo') DEFAULT 'prevista',
  PRIMARY KEY (`id_turma`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `turmas_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.turmas: ~3 rows (aproximadamente)
INSERT INTO `turmas` (`id_turma`, `id_curso`, `nome_sgset`, `local`, `turno`, `inicio`, `termino`, `carga_horaria`, `vagas`, `matriculas`, `status`) VALUES
	(76, 101, 'MPBI', 'Laboratório 3', 'M', '2025-11-28', '2025-12-24', 48, 30, 27, 'verde');

-- Copiando estrutura para tabela gerenciamento_1.turmas_horarios
CREATE TABLE IF NOT EXISTS `turmas_horarios` (
  `id_horario` int(11) NOT NULL AUTO_INCREMENT,
  `id_turma` int(11) NOT NULL,
  `dia_semana` enum('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo') NOT NULL,
  `horario_inicio` time NOT NULL,
  `horario_fim` time NOT NULL,
  PRIMARY KEY (`id_horario`),
  KEY `fk_turmas_horarios_turma` (`id_turma`),
  CONSTRAINT `fk_turmas_horarios_turma` FOREIGN KEY (`id_turma`) REFERENCES `turmas` (`id_turma`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `turmas_horarios_ibfk_1` FOREIGN KEY (`id_turma`) REFERENCES `turmas` (`id_turma`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.turmas_horarios: ~6 rows (aproximadamente)
INSERT INTO `turmas_horarios` (`id_horario`, `id_turma`, `dia_semana`, `horario_inicio`, `horario_fim`) VALUES
	(155, 76, 'Segunda', '13:00:00', '17:00:00'),
	(156, 76, 'Quarta', '13:00:00', '17:00:00'),
	(157, 76, 'Sexta', '13:00:00', '17:00:00');

-- Copiando estrutura para tabela gerenciamento_1.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nif` varchar(20) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo` enum('gestao','asa') NOT NULL,
  `ultimo_acesso` date DEFAULT NULL,
  `ja_logou` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nif` (`nif`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.usuarios: ~4 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nif`, `senha`, `cargo`, `ultimo_acesso`, `ja_logou`) VALUES
	(35, '7654321', '$2b$10$GaAfIMW5pEbB1.cPLwEvZ.bYsDUGB61cnU5Crvn9S5LYRLt3YBunW', 'gestao', NULL, 0),
	(36, '1234567', '$2b$10$97O4koakVhcodsvAMGaumegmfvTOKxuRvXDzBl.BWuiEOypY1p3K2', 'asa', NULL, 0);

-- Copiando estrutura para tabela gerenciamento_1.usuarios_permissoes
CREATE TABLE IF NOT EXISTS `usuarios_permissoes` (
  `id_usuario` int(11) NOT NULL,
  `id_permissao` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_permissao`),
  KEY `id_permissao` (`id_permissao`),
  CONSTRAINT `usuarios_permissoes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuarios_permissoes_ibfk_2` FOREIGN KEY (`id_permissao`) REFERENCES `permissoes` (`id_permissao`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela gerenciamento_1.usuarios_permissoes: ~1 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
