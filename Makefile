build:
	docker build -t pocket-smarty-pants .

run:
	docker run -d -p 3000:3000 --name pocket-smarty-pants --rm pocket-smarty-pants