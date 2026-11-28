-- La serĉkampo "Urbo, lando aŭ intereso": trovi urbon aŭ regionon laŭ nomo en
-- ĉiuj landoj (ne nur en unu), kun malmultaj legitaj vicoj.
CREATE INDEX urboj_tutmonde ON urboj (sercxnomo, logxantoj DESC);
CREATE INDEX urboj_nomo_eo ON urboj (nomo_eo COLLATE NOCASE);
CREATE INDEX regionoj_tutmonde ON regionoj (sercxnomo);
