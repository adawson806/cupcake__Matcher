-- Use the database created by Cupcake_Database.sql
USE cupcakeMatcher;

-- 1. Insert Retailers
INSERT INTO retailer (rname, location) VALUES
('Sweet Spot Bakery', '123 Main St, Anytown'),
('The Icing on the Cake', '45 North Ave, Big City'),
('Cupcake Corner', '789 Oak Ln, Smallville'),
('Gourmet Treats', '101 Pine Blvd, Suburbia');

-- 2. Insert Cupcakes with Flavor Profiles
INSERT INTO cupcake (cname, flavor_profile) VALUES
('Death by Chocolate', 'Chocolate Lover'),
('Classic Vanilla', 'Vanilla Classic'),
('Almond Joy', 'Nutty Coconut'),
('Raspberry Lemon', 'Fruity Citrus'),
('Pumpkin Spice Latte', 'Spice Beverage'),
('Triple Chocolate Jack Daniels', 'Boozy Chocolate'),
('Carrot Cake', 'Spice Savory'),
('Funfetti', 'Vanilla Classic'),
('Mocha Nutella', 'Chocolate Coffee Nutty'),
('Peanut Butter Hi Hat', 'Nutty Chocolate');

-- 3. Insert Ingredients
INSERT INTO ingredients (iname, category) VALUES
('All-Purpose Flour', 'Base'),
('Sugar', 'Base'),
('Eggs', 'Base'),
('Butter', 'Base'),
('Cocoa Powder', 'Base'),
('Vanilla Extract', 'Flavoring'),
('Baking Powder', 'Leavening'),
('Milk', 'Liquid'),
('Salt', 'Seasoning'),
('Chocolate Chips', 'Topping'),
('Almonds', 'Nut'),
('Coconut Flakes', 'Topping'),
('Lemon Juice', 'Flavoring'),
('Raspberries', 'Fruit'),
('Pumpkin Puree', 'Base'),
('Cinnamon', 'Spice'),
('Espresso', 'Beverage'),
('Jack Daniels', 'Alcohol'),
('Carrots', 'Produce'),
('Cream Cheese', 'Icing');

-- 4. Insert Contains (Cupcake-Ingredient relationship)
INSERT INTO contains (cname, iname) VALUES
-- Death by Chocolate
('Death by Chocolate', 'All-Purpose Flour'), ('Death by Chocolate', 'Sugar'), ('Death by Chocolate', 'Eggs'), ('Death by Chocolate', 'Cocoa Powder'), ('Death by Chocolate', 'Chocolate Chips'),
-- Classic Vanilla
('Classic Vanilla', 'All-Purpose Flour'), ('Classic Vanilla', 'Sugar'), ('Classic Vanilla', 'Eggs'), ('Classic Vanilla', 'Vanilla Extract'), ('Classic Vanilla', 'Baking Powder'),
-- Almond Joy
('Almond Joy', 'All-Purpose Flour'), ('Almond Joy', 'Sugar'), ('Almond Joy', 'Eggs'), ('Almond Joy', 'Almonds'), ('Almond Joy', 'Coconut Flakes'),
-- Raspberry Lemon
('Raspberry Lemon', 'All-Purpose Flour'), ('Raspberry Lemon', 'Sugar'), ('Raspberry Lemon', 'Eggs'), ('Raspberry Lemon', 'Lemon Juice'), ('Raspberry Lemon', 'Raspberries'),
-- Pumpkin Spice Latte
('Pumpkin Spice Latte', 'All-Purpose Flour'), ('Pumpkin Spice Latte', 'Sugar'), ('Pumpkin Spice Latte', 'Eggs'), ('Pumpkin Spice Latte', 'Pumpkin Puree'), ('Pumpkin Spice Latte', 'Cinnamon'), ('Pumpkin Spice Latte', 'Espresso'),
-- Triple Chocolate Jack Daniels
('Triple Chocolate Jack Daniels', 'All-Purpose Flour'), ('Triple Chocolate Jack Daniels', 'Sugar'), ('Triple Chocolate Jack Daniels', 'Eggs'), ('Triple Chocolate Jack Daniels', 'Cocoa Powder'), ('Triple Chocolate Jack Daniels', 'Jack Daniels'),
-- Carrot Cake
('Carrot Cake', 'All-Purpose Flour'), ('Carrot Cake', 'Sugar'), ('Carrot Cake', 'Eggs'), ('Carrot Cake', 'Carrots'), ('Carrot Cake', 'Cinnamon'), ('Carrot Cake', 'Cream Cheese'),
-- Funfetti
('Funfetti', 'All-Purpose Flour'), ('Funfetti', 'Sugar'), ('Funfetti', 'Eggs'), ('Funfetti', 'Baking Powder'), ('Funfetti', 'Sprinkles'),
-- Mocha Nutella
('Mocha Nutella', 'All-Purpose Flour'), ('Mocha Nutella', 'Sugar'), ('Mocha Nutella', 'Eggs'), ('Mocha Nutella', 'Cocoa Powder'), ('Mocha Nutella', 'Espresso'), ('Mocha Nutella', 'Hazelnut Spread'),
-- Peanut Butter Hi Hat
('Peanut Butter Hi Hat', 'All-Purpose Flour'), ('Peanut Butter Hi Hat', 'Sugar'), ('Peanut Butter Hi Hat', 'Eggs'), ('Peanut Butter Hi Hat', 'Peanut Butter'), ('Peanut Butter Hi Hat', 'Chocolate Coating');

-- 5. Insert Cupcake Available at Retailer (Ensuring every cupcake has a retailer)
INSERT INTO cupcake_available_at (cname, rname, location) VALUES
('Death by Chocolate', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('Classic Vanilla', 'The Icing on the Cake', '45 North Ave, Big City'),
('Almond Joy', 'Cupcake Corner', '789 Oak Ln, Smallville'),
('Raspberry Lemon', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('Pumpkin Spice Latte', 'Gourmet Treats', '101 Pine Blvd, Suburbia'),
('Triple Chocolate Jack Daniels', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('Carrot Cake', 'The Icing on the Cake', '45 North Ave, Big City'),
('Funfetti', 'Cupcake Corner', '789 Oak Ln, Smallville'),
('Mocha Nutella', 'Gourmet Treats', '101 Pine Blvd, Suburbia'),
('Peanut Butter Hi Hat', 'Sweet Spot Bakery', '123 Main St, Anytown');

-- 6. Insert Ingredients Available at Retailer (Partial - used for Recipe Suggestion)
INSERT INTO ingredients_available_at (iname, rname, location) VALUES
('All-Purpose Flour', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('Sugar', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('Eggs', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('Cocoa Powder', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('Vanilla Extract', 'Sweet Spot Bakery', '123 Main St, Anytown'),
('All-Purpose Flour', 'The Icing on the Cake', '45 North Ave, Big City'),
('Sugar', 'The Icing on the Cake', '45 North Ave, Big City'),
('Eggs', 'The Icing on the Cake', '45 North Ave, Big City');