
/*
 * Entity topic_provider. Identified by a surrogate id.
 */
CREATE TABLE `topic_provider`(
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `url` VARCHAR(2047) NOT NULL,
  `parser` VARCHAR(255) NOT NULL
);

COMMIT;